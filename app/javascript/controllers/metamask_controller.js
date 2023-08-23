// javascript/controllers/metamask_controller.js

import { Controller } from "@hotwired/stimulus";
import Profile from "../models/profile";
import EthereumManager from "../models/ethereum_manager";
import UIManager from "../models/ui_manager";
import { ethers } from "ethers";

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
    this.uiManager = new UIManager(this);  // Introduzindo UIManager
    this.profileInstance = null;

    this.ethManager.initialized.then(() => {
      this.connect();
    }).catch(error => {
      console.error("Erro durante a inicialização:", error);
    });
  }

  connect() {
    if (this.ethManager.isConnected) {
      this.uiManager.syncComponents();
    } else {
      this.ethManager.connectMetamask()
        .then(() => {
          this.uiManager.syncComponents();
        })
        .catch(error => {
          console.error('Erro ao conectar:', error);
        });
    }
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

      const response = await fetch(`/coffees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-CSRF-Token': this.csrfToken,
        },
        body: JSON.stringify({
          coffee: {
            profile_id: 1,
            contract_id: contract_id,
            sender_wallet_address: this.ethManager.userAddress,
            name: "Coffee",
            amount: eth_price,
            message: "Thank you for the coffee!",
            tx_hash: transaction.hash
          }
        }),
      });

      this.uiManager.setPointerEventsNone("formTarget");
      this.uiManager.showNotification("Processing...", "We are almost there.");

      await transaction.wait();
      this.uiManager.showNotification("Success", "Your coffee is on its way!");
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
      this.uiManager.updateWithdrawButton(profileBalance);  // Using UIManager

    } catch (error) {
      console.log(error);
    }
  }

  async withdraw() {
    try {
      const transaction = await this.ethManager.contract.withdrawProfileBalance();
      this.uiManager.setPointerEventsNone("withdrawTarget");
      this.uiManager.showNotification("Processing...", "We are almost there.");
      await transaction.wait();
      this.uiManager.showNotification("Success", "Your funds have been withdrawn!");
      window.location.reload();

    } catch (error) {
      console.log(error);
      alert("Transaction failed!");
    }
  }

  // Get profile coffees and display them as messages on the page
  async getProfileCoffees(walletAddress) {
    try {
      const response = await fetch(`/coffees.json`);
      const data = await response.json();

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

      console.log(transactions);
      this.uiManager.clearResults();
      transactions
        .slice(0)
        .reverse()
        .map((txn) => {
          this.uiManager.addResultItem(txn);
        });
    } catch (error) {
      console.log(error);
    }
  }
}
