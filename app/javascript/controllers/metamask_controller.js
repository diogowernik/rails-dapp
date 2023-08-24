// javascript/controllers/metamask_controller.js

import { Controller } from "@hotwired/stimulus";
import { ethers } from "ethers";

import EthereumManager from "../models/ethereum_manager";
import NotificationManager from "../models/notification_manager";
import WalletManager from "../models/wallet_manager";
import ProfileBalanceManager from "../models/profile_balance";
import ProfileCoffeesManager from "../models/profile_coffees";

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

    this.notificationManager = new NotificationManager(this.notificationTarget);

    this.walletManager = new WalletManager(this.ethManager, {
      connectTarget: this.connectTarget,
      walletTarget: this.walletTarget,
      resultsTarget: this.resultsTarget,
      formTarget: this.formTarget,
      addressTarget: this.addressTarget,
      balanceTarget: this.balanceTarget,
      walletAddressTarget: this.walletAddressTarget,
      withdrawTarget: this.withdrawTarget
    }, this); 

    this.setupMetaMaskListeners();

    this.ethManager.initialized.then(() => {
      this.connect();
    }).catch(error => {
      console.error("Erro durante a inicialização:", error);
    });

    this.profileCoffeesManager = new ProfileCoffeesManager(this.ethManager);
    this.profileBalanceManager = new ProfileBalanceManager(this.ethManager);

    
  }

  setupMetaMaskListeners() {
    // Quando a conta no MetaMask muda
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log("Conta do MetaMask mudou:", accounts);
      // Aqui, reconectamos e sincronizamos componentes.
      this.connect();
    });

    // Quando a rede no MetaMask muda
    window.ethereum.on('chainChanged', () => {
      console.log("Rede do MetaMask mudou");
      // Uma abordagem direta é simplesmente recarregar a página para começar de um estado limpo.
      window.location.reload();
    });
  }

  connect() {
    if (this.ethManager.isConnected) {
      this.walletManager.syncComponents();
    } else {
      this.ethManager.connectMetamask()
        .then(() => {
          this.walletManager.syncComponents();
        })
        .catch(error => {
          console.error('Erro ao conectar:', error);
        });
    }
  }

  async showNotification(title, message) {
    this.notificationManager.showNotification(title, message);
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

  // Lista de coffees, doações recebidas pelo perfil
  async getProfileCoffees(walletAddress) {
    try {
        const transactions = await this.profileCoffeesManager.getCoffees(walletAddress);
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

  // Saldo do perfil
  async getProfileBalance(walletAddress) {
    try {
        const profileBalance = await this.profileBalanceManager.getBalance(walletAddress);
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
