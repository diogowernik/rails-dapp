// javascript/controllers/metamask_controller.js

import { Controller } from "@hotwired/stimulus";
import { ethers } from "ethers";

import Profile from "../models/profile_manager";
import EthereumManager from "../models/ethereum_manager";
import TransactionManager from "../models/transaction_manager";

let profileInstance = null;

export default class extends Controller {
  static targets = [
    "connect",
    "wallet",
    "results",
    "form",
    "address",
    "balance",
    "price",
    "notification",
    "transactionTemplate",
    "withdraw",
    "profileAddress",
    "walletAddress",
    "contractId",
  ];

  initialize() {
    this.ethManager = new EthereumManager();
    this.transactionManager = new TransactionManager(this.ethManager);
    this.profileInstance = null;

    this.ethManager.initialized.then(() => {
      this.connect();
    }).catch(error => {
      console.error("Erro durante a inicialização:", error);
    });
  }

  connect() {
    if (this.ethManager.isConnected) {
      this.syncComponents();
    } else {
      this.ethManager.connectMetamask()
        .then(() => {
          this.syncComponents();
        })
        .catch(error => {
          console.error('Erro ao conectar:', error);
        });
    }
  }

  syncComponents() {
    if (this.ethManager.isConnected) {
      this.connectTarget.hidden = true;
      this.walletTarget.hidden = false;
      this.resultsTarget.hidden = false;
      this.formTarget.hidden = false;

      const userAddress = this.ethManager.userAddress;

      this.addressTarget.innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-3)}`.toUpperCase();

      this.ethManager.provider.getBalance(userAddress).then(userBalance => {
        userBalance = ethers.utils.formatEther(userBalance);
        this.balanceTarget.innerText = Math.round(userBalance * 10000) / 10000;
      });

      const walletAddress = this.walletAddressTarget.innerText.replace(/\n/g, "");
      const isOwner = userAddress.toLowerCase() === walletAddress.toLowerCase();

      if (isOwner) {
        this.withdrawTarget.hidden = false;
      }

      this.getProfileCoffees(walletAddress);
      this.getProfileBalance(walletAddress);

      window.ethereum.on("accountsChanged", (accounts) => {
        window.location.reload();
      });

    } else {
      console.log("wallet not connected");
      this.connectTarget.hidden = false;
      this.walletTarget.hidden = true;
      this.resultsTarget.hidden = true;
      this.formTarget.hidden = true;
      this.addressTarget.innerText = "";
    }
  }

  async showNotification(title, message) {
    const item = this.notificationTarget;
    item.querySelector(".type").innerText = title;
    item.querySelector(".message").innerText = message;
    this.notificationTarget.hidden = false;
  }

  get csrfToken() {
    const metaTag = document.querySelector("meta[name='csrf-token']");
    return metaTag ? metaTag.content : "";
  }

  async buyCoffee() {
    try {
      const profileAddress = this.profileAddressTarget.value;
      const eth_price = this.priceTarget.innerText;
      const contract_id = this.contractIdTarget.value;

      const transaction = await this.ethManager.contract.buymeacoffee(
        profileAddress,
        contract_id,
        { value: ethers.utils.parseEther(eth_price) }
      );

      await this.transactionManager.recordTransaction(profileAddress, contract_id, eth_price, transaction.hash);

      this.formTarget.classList.add("pointer-events-none");
      this.showNotification("Processing...", "We are almost there.");

      await transaction.wait();
      this.showNotification("Success", "Your coffee is on its way!");
      window.location.reload();

    } catch (error) {
      console.log(error);
      alert("Transaction failed!");
    }
  }

  async getProfileBalance(walletAddress) {
    try {
      if (!profileInstance) profileInstance = new Profile(this.ethManager.contract);
      let profileBalance = await profileInstance.getBalance(walletAddress);
      profileBalance = Math.round(profileBalance * 10000) / 10000;

      if (profileBalance > 0) {
        this.withdrawTarget.innerText = `Withdraw ${profileBalance} ETH`;
      } else {
        this.withdrawTarget.disabled = true;
        this.withdrawTarget.innerText = "No fund to withdraw";
      }

    } catch (error) {
      console.log(error);
    }
  }

  async withdraw() {
    try {
      const transaction = await this.ethManager.contract.withdrawProfileBalance();
      this.withdrawTarget.classList.add("pointer-events-none");
      this.showNotification("Processing...", "We are almost there.");
      await transaction.wait();
      this.showNotification("Success", "Your funds have been withdrawn!");
      window.location.reload();

    } catch (error) {
      console.log(error);
      alert("Transaction failed!");
    }
  }

  // No método getProfileCoffees, a parte de buscar as transações pode ser atualizada.
  async getProfileCoffees(walletAddress) {
    try {
      const data = await this.transactionManager.getTransactionsForWallet(walletAddress);

      let transactions = await profileInstance.getCoffees(walletAddress); 

      transactions = transactions.map((txn) => {
        return {
          profile: txn.profile,  
          supporter: txn.supporter,  
          amount: ethers.utils.formatEther(txn.amount),  
          contract_id: txn.contract_id.toNumber(),  
        };
      });

      transactions = transactions.map((txn) => {
        const coffee = data.find((coffee) => coffee.contract_id === txn.contract_id);
        return {
          ...txn,
          name: coffee.name,
          message: coffee.message,
        };
      });
      console.log(transactions)

      this.resultsTarget.innerText = "";
      transactions
        .slice(0)
        .reverse()
        .map((txn) => {
          this.addResultItem(txn);
        });
    } catch (error) {
        console.log(error); 
    }
  }


  addResultItem(txn) {
    const item =
      this.transactionTemplateTarget.content.firstElementChild.cloneNode(true);

    const tx_eth = txn.amount;
    const tx_address = `${txn.supporter.slice(0, 6)}...${txn.supporter.slice(
      -3
    )}`.toUpperCase();


    item.querySelector(".supporter").innerText = txn.name;
    item.querySelector(".message").innerText = txn.message;
    item.querySelector(".price").innerText = `supported ${tx_eth} ETH`;
    item.querySelector(".address").innerText = tx_address;

    this.resultsTarget.append(item);
  }
}
