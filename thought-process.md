**Working - StreamDump**
- [x] Re-escrever toda a tipagem do projeto
- [x] Instalar lib `pino.js`
- [x] Re-escrever apenas o objeto de contexto e rever as tipagens & Split em outros arquivos
	- Utilizar query apenas no ReadStorage
	- Utilizar write, normalize apenas no WriteStorage
- [ ] Re-escrever a main.ts
	- [x] Escrever LockManager (gpt winsnss!! mas obrigado EU ENTENDI)
	- [x] Escrever OffsetManager 
	[Required-1]
	- [x] Escrever Worker (PORRA NÃO É QUE FIZEMOS?)
		- [ ] Implementar meio de notificações para worker-manager  
	- [x] Escrever WorkerManager 
		- [ ] TESTAR WORKER-MANAGER
		- [x] Recebimento das notificações dos workers ? 
		- WorkerManager conhece OffsetManager ?
			- y - notificações aqui
			- (prefiro) *n - notificações dentro de StreamProcess*
		- [!!] É necessário adicionar `offsetManager.addHistory` quando worker responder 
	- [x] PollingManager ficou dentro de WorkerManager (MAS FIZEMOS!)
	
- [ ] Implementar script de worker que recebe mensagem processa e notifica
- [ ] Escrever StreamProcess function (AQUI AGORA!)
**Fluxo:**
	1. [x] Instanciar offset 
	2. [ ] Load dos workers (getOffset para cada)
	3. [ ] Handler de notificações
	4. [!!! ] Como aplicar o conceito de workers em node.js (de fato)
	5. (opt for now) Handle em JSON dos erros  
	[EXEMPLO - 1 -> size: 1000, chunksize: 100, workers: 5]

```
1. Para cada worker disponível
	- solicitar um novo chunk (offset)
	- worker.run(context)
 2. Receber notificações dos workers
	- sucesso -> Worker disponível para novo chunk
	- end -> Stream concluída (nenhum dado novo na query)
	- error -> Registrar history {workeridx, pagination, error}
	- failure -> Salvar registro atual do history em JSON (por hora sem nenhum buffer)
 e interrompe o processo
		 Casos possíveis de falha para tratamento:
		 - Conexão entre os bancos cai

(next)
1. Adicionar history no offsetManager para inicializar a partir do ponto desejado
 ou dos pontos específicos de falha
```

--- 


	- Somente chamada das funções e export das fns primárias
- [ ] Escrever worker & test 
- [ ] Escrever método de polling com as funções `start, continue, end`
- [ ] Escrever maneira simulada de escrita `json -> json`
- [ ] Escrever maneira simulada `mongo -> sql`

--- 
**Fluxo de depêndencias**
```js
main - @SourceStream 
@StreamProcess (Main process - Should handle every notification)
	@OffsetManager
		@LockManager
	@WorkersManager
		@LockManager
		@Worker
		
! - [] Worker should notify WorkersManager - How it can notify back StreamProcess (node-events?)
```

---
**Worker-Manager ou Stream-Process para gerenciar os eventos ?**

- Creio que faça mais sentido atrelar essa responsabilidade para WorkerManager, ainda que o fluxo de notificação para StreamProcess possa dificultar isso
[Required-1]
- [ ] Compreender como spawnar workers & notificar de volta 
- [ ] Elaborar fluxo de notificações após compreender como a comunicação entre main -> workers deve acontecer

---
**Mudanças no fluxo ?**

OffsetManager no estado atual tem a responsabilidade de manusear o histórico de Offsets e está registrando qual foi o Worker responsável pelo offset. 
- Creio que ele deva apenas ser responsável por lidar com o Offset e não seja interessante que acesse workeridx 

***Acredito*** que o lugar ideal para armazenar o history seja dentro do `WorkersManager`, ou quem sabe do próprio `StreamProcess` ? 

**Resumo da opera:**
- [ ] @TODO: Mudanças em OffsetManager 
	- OffsetManager não deve ser responsável pelo histórico dos workers
	- [ ] OffsetManager deve conhecer apenas ***o offset OU lista*** de offsets a percorrer 
	- offset = 0 || offset = [1, 2, 3, ...] - getOffset deve entender e retornar apropriadamente

---
**Conclusões do Dia**

- [ ] Publicar o projeto como está no Github e enviar e-mail relatando seu progresso e que pretende concluir ainda amanhã. 
** __ __ ** 
[!] - Sobre o novo funcionamento dos workers:
- É necessário que instanciemos os storages novamente dentro dos workers, portanto: 
	- As instâncias vinham diretamente do contexto, e ***passarão a vir*** de um arquivo que deve ser escrito em Javascript. 
	- O método streamWorker.run será responsável por abrir e fechar um worker, e irá notificar através de um singleton event-emitter para StreamProcess o resultado. 
	- O próprio stram-worker irá lockar & deslockar a si mesmo nos finais das operações 
** __ __ ** 

---

[!] - Adicionais
- [ ] Promise para alteração de estado (ou start de novo worker)
- [ ] É necessário se preocupar com possíveis falhas durante o processo, como:
- Um dos sources parou de responder 
- De que forma podemos resgatar os possíveis erros sem perder o que foi concluído com sucesso ?
- [ ] Considerar o uso de history para processar os offsets remanescentes

[!!] - Se preocupar com um possível caso de racing na atualização dos estados feitos pelos workers
- Para mitigar esta situação, devemos nos concentrar em enviar o dado do próximo offset para o worker atual e atualizar antes de iniciar um novo processo. (Podemos utilizar uma Promise no método `worker.start`)

--- 

3. Start do polling de workers  
```js
workers = [worker_1, worker_2, worker_3]

// Polling
var pollingInterval;

function callWorker = (idx: number, context: Context) => {
	processContext.workers[idx].processing = true 
	processContext.offset = processContext.offset + processContext.params.chunksize
	startWorker(idx, context)
}

function startPolling () {
	pollingInterval = setInterval(() => {
		worker = getWorker()
		if worker:
			// @do: get and set the new range on context
			worker.processing = true
			workerContext = { } 
			context.offset = context.offset + context.stream.chunksize
			callWorker(worker.idx, context)
	}, 1000)
}

function stopPolling () {
	clearInterval(pollingInterval); 
}
```


4. Manejo das tratativas de notificações
```js
[Notifications]
'completed' - Worker concluiu e pode voltar a receber novas solicitações
'error' - Worker teve um problema durante a operação [message, range] (@TODO: É possível realizar uma compensação nesse momento?)
'end' - Query retornou um valor vazio 

on('completed') {
	processContext.workers[idx].processing = false 
	log(`[DUMP-DB] - Worker ${idx} added rows successfully`)
}

on('end') {
	processContext.stopPolling()
	return [true, undefined]
	log('[dump-db] - Querying is not returning new rows, the process is end')
}

on('error') {
	log(`[dump-db] - Worker ${idx} encountered an error when trying to add rows - offset: ${offset}`)
}
```

**Funcionamento de um worker**
- Worker 1 -> 0, 1000  
- Worker 2 -> 1001, 2000  
```js
@storages - access, store 
@range - limit, offset
function Worker(storages, range): void 
1. accessStorage.query(range) - Retorna um conjunto de dados de accessStorage 
1.1 if query.length === 0 - return notify('end')
2. storeStorage.normalize(queryResult) - Normaliza um conjunto de dados para o storeStorage
3. storeStorage.write(normalized)
4. if error - notify('error', { message, range })
5. return notify('completed')

[Notifications]
'completed' - Worker concluiu e pode voltar a receber novas solicitações
'error' - Worker teve um problema durante a operação [message, range] (@TODO: É possível realizar uma compensação nesse momento?)
'end' - Query retornou um valor vazio 
```
