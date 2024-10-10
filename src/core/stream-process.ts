import { 
    SourceStreamContext,
} from './../types'
import { OffsetManager } from './offset-manager'
import { StreamWorkerManager } from './stream-worker-manager'

class StreamProcess {
    private offsetManager: OffsetManager
    private workersManager: StreamWorkerManager
    private context: SourceStreamContext

    constructor(context: SourceStreamContext) {
        this.offsetManager = new OffsetManager(context.params.chunkSize)
        this.workersManager = new StreamWorkerManager(context.params.maxWorkers)
        this.context = context
    }

    /**
     * 1. Para cada worker disponível
     *  - solicitar um novo chunk (offset)
     *  - worker.run(context)
     * 2. Receber notificações dos workers
     *  - sucesso -> Worker disponível para novo chunk 
     *  - end -> Stream concluída (nenhum dado novo na query)
     *  - error -> Registrar history {workeridx, pagination, error}
     *  - failure -> Salvar registro atual do history em JSON (por hora sem nenhum buffer) 
     * e interrompe o processo 
     *     Casos possíveis de falha para tratamento: 
    *      - Conexão entre os bancos cai
     *  
     *  - (next)
     *  1. Adicionar history no offsetManager para inicializar a partir do ponto desejado 
     * ou dos pontos específicos de falha 
     */

    public async start() {
        
    }
    
}