// javascript/models/ui_manager.js
// ethers
import { ethers } from "ethers";

export default class UIManager {
    constructor(controller) {
      this.controller = controller;
    }
  
    syncComponents() {
      if (this.controller.ethManager.isConnected) {
        this.controller.connectTarget.hidden = true;
        this.controller.walletTarget.hidden = false;
        this.controller.resultsTarget.hidden = false;
        this.controller.formTarget.hidden = false;
  
        const userAddress = this.controller.ethManager.userAddress;
  
        this.controller.addressTarget.innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-3)}`.toUpperCase();
  
        this.controller.ethManager.provider.getBalance(userAddress).then(userBalance => {
          userBalance = ethers.utils.formatEther(userBalance);
          this.controller.balanceTarget.innerText = Math.round(userBalance * 10000) / 10000;
        });
  
        const walletAddress = this.controller.walletAddressTarget.innerText.replace(/\n/g, "");
        const isOwner = userAddress.toLowerCase() === walletAddress.toLowerCase();
  
        if (isOwner) {
          this.controller.withdrawTarget.hidden = false;
        }
  
      } else {
        console.log("wallet not connected");
        this.controller.connectTarget.hidden = false;
        this.controller.walletTarget.hidden = true;
        this.controller.resultsTarget.hidden = true;
        this.controller.formTarget.hidden = true;
        this.controller.addressTarget.innerText = "";
      }
    }
  
    showNotification(title, message) {
      const item = this.controller.notificationTarget;
      item.querySelector(".type").innerText = title;
      item.querySelector(".message").innerText = message;
      this.controller.notificationTarget.hidden = false;
    }
  
    setPointerEventsNone(elementTarget) {
      this.controller[elementTarget].classList.add("pointer-events-none");
    }
  
    updateWithdrawButton(profileBalance) {
      profileBalance = Math.round(profileBalance * 10000) / 10000;
  
      if (profileBalance > 0) {
        this.controller.withdrawTarget.innerText = `Withdraw ${profileBalance} ETH`;
      } else {
        this.controller.withdrawTarget.disabled = true;
        this.controller.withdrawTarget.innerText = "No fund to withdraw";
      }
    }
  
    clearResults() {
      this.controller.resultsTarget.innerText = "";
    }
  
    addResultItem(txn) {
      const item = this.controller.transactionTemplateTarget.content.firstElementChild.cloneNode(true);
  
      const tx_eth = txn.amount;
      const tx_address = `${txn.supporter.slice(0, 6)}...${txn.supporter.slice(-3)}`.toUpperCase();
  
      item.querySelector(".supporter").innerText = txn.name;
      item.querySelector(".message").innerText = txn.message;
      item.querySelector(".price").innerText = `supported ${tx_eth} ETH`;
      item.querySelector(".address").innerText = tx_address;
  
      this.controller.resultsTarget.append(item);
    }
  }
  