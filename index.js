class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency; // Número máximo de tarefas simultâneas
    this.currentConcurrency = 0;         // Contador de tarefas em execução
    this.queue = [];                     // Fila de tarefas aguardando execução
  }

  // Método para adquirir uma permissão
  async acquire() {
    if (this.currentConcurrency < this.maxConcurrency) {
      // Se ainda há espaço, permite executar
      this.currentConcurrency++;
    } else {
      // Caso contrário, adiciona a tarefa à fila
      await new Promise(resolve => this.queue.push(resolve));
    }
  }

  // Método para liberar uma permissão
  release() {
    if (this.queue.length > 0) {
      // Libera a próxima tarefa na fila
      const nextTask = this.queue.shift();
      nextTask(); // Resolve a Promise da tarefa seguinte
    } else {
      // Reduz o contador de tarefas em execução
      this.currentConcurrency--;
    }
  }

  // Executa uma função garantindo o controle de concorrência
  async run(task) {
    await this.acquire(); // Adquire permissão antes de executar
    try {
      return await task(); // Executa a tarefa fornecida
    } finally {
      this.release(); // Libera permissão após a execução
    }
  }
}

// Exemplo de uso
(async () => {
  const semaphore = new Semaphore(2); // Semáforo permitindo 2 tarefas simultâneas

  // Função simulando uma tarefa assíncrona
  const simulateTask = async (id) => {
    console.log(`Tarefa ${id} iniciou`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula uma tarefa de 2 segundos
    console.log(`Tarefa ${id} finalizou`);
  };

  // Lista de tarefas
  const tasks = [1, 2, 3, 4, 5].map(id => () => semaphore.run(() => simulateTask(id)));

  // Executa todas as tarefas simultaneamente
  await Promise.all(tasks.map(task => task()));

  console.log("Todas as tarefas foram concluídas");
})();