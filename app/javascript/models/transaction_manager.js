// javascript/models/transaction_manager.js

class TransactionManager {

    constructor(ethManager) {
      this.ethManager = ethManager;
    }
  
    // Grava uma transação
    async recordTransaction(profileAddress, contractId, ethPrice, transactionHash) {
      try {
        const response = await fetch(`/coffees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'X-CSRF-Token': this.csrfToken(),
          },
          body: JSON.stringify({
            coffee: {
              profile_id: 1, // Aqui, você pode precisar ajustar para pegar o ID do perfil correto
              contract_id: contractId,
              sender_wallet_address: this.ethManager.userAddress,
              name: "Coffee",
              amount: ethPrice,
              message: "Thank you for the coffee!",
              tx_hash: transactionHash
            }
          }),
        });
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Erro ao gravar a transação:", error);
        throw error;
      }
    }
  
    // Busca transações para um determinado endereço de carteira
    async getTransactionsForWallet(walletAddress) {
      try {
        const response = await fetch(`/coffees.json`);
        const data = await response.json();
  
        // Você pode adicionar lógica adicional aqui se precisar filtrar as transações por endereço de carteira
        return data.filter(transaction => transaction.sender_wallet_address === walletAddress);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        throw error;
      }
    }
  
    csrfToken() {
      const metaTag = document.querySelector("meta[name='csrf-token']");
      return metaTag ? metaTag.content : "";
    }
  }
  
  export default TransactionManager;
  