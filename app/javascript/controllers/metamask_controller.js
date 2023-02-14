import { Controller } from "@hotwired/stimulus";
import { ethers } from "ethers";
import abi from "../contract.json" assert { type: "json" };

// constant for the contract address to interact with 
const CONTRACT_ADDRESS = "0xc940271B721422572AcdDF797098F61dBd4BF3f3";

// constant for the contract's ABI (Application Binary Interface) to interact with 
const CONTRACT_ABI = abi.abi;

// variables to store data
let walletConnected = false;
let userAddress = null;
let userBalance = null;
let provider = null;
let contract = null;
let transactions = [];

export default class extends Controller {
  // these are the targets for the HTML elements used in the code
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
  ];

  // method that triggers when the connect button is clicked
  connect() {
    this.isWalletConnected();
  }

  // method to check if a wallet (e.g. Metamask) is connected
  async isWalletConnected() {
    // check if the window has an `ethereum` object
    if (window.ethereum) {
      // use the `eth_accounts` method to get the user's accounts from the connected wallet
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      // call the `syncComponents` method to sync the data with the HTML components
      this.syncComponents(accounts);
    } 
  }
  
  // method to connect to Metamask
  async connectMetamask() {
    // check if the window has an `ethereum` object
    if (window.ethereum) {
      // use the `eth_requestAccounts` method to request the user's accounts from the connected wallet
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // call the `syncComponents` method to sync the data with the HTML components
      this.syncComponents(accounts);
    } else {
      console.log("Please install Metamask");
    }
  }

  // method to set up the contract to interact with
  async setupContract() {
    // check if a wallet is connected and a provider is available
    if (walletConnected && provider) {
      // create a new instance of the `Contract` class from the `ethers` library
      contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider.getSigner()
      );


      console.log("Contract is set up successfully", contract);
    }
  }

  // method to sync data with the HTML components
  async syncComponents(accounts) {
    // create a new instance of the `Web3Provider` class from the
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // check if the user has connected a wallet
    if (accounts.length > 0) {
      walletConnected = true;
      userAddress = accounts[0];
      console.log("your account address is: " + accounts[0]);
      // hide connect button
      this.connectTarget.hidden = true;
      // show elements
      this.walletTarget.hidden = false;
      this.resultsTarget.hidden = false;
      this.formTarget.hidden = false;

      this.addressTarget.innerText = `${userAddress.slice(
        0,
        6
      )}...${userAddress.slice(-3)}`.toUpperCase(); 
      
      userBalance = await provider.getBalance(userAddress);
      userBalance = ethers.utils.formatEther(userBalance);
      this.balanceTarget.innerText = Math.round(userBalance * 10000) / 10000;
      console.log("your balance is: " + userBalance + " ETH")

      await this.setupContract();

      // get all coffee transactions
      transactions = await contract.getAllCoffee();
      console.log(transactions);

     

      // metamask event: reload page if account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        window.location.reload();
      });

    } else {
      walletConnected = false;
      console.log("wallet not connected");
      // show connect button
      this.connectTarget.hidden = false;
      // hide elements
      this.walletTarget.hidden = true;
      this.resultsTarget.hidden = true;
      this.formTarget.hidden = true;
      this.addressTarget.innerText = "";
    }
  }

  // method to show a notification
  async showNotification(title, message) {
    const item = this.notificationTarget;
    item.querySelector(".type").innerText = title;
    item.querySelector(".message").innerText = message; 
    this.notificationTarget.hidden = false;
  }

  // method to buy coffee with ETH
  async buyCoffee() {
    try {
      const profileAddress = this.profileAddressTarget.value;
      const eth_price = this.priceTarget.innerText;


      // execute transaction
      const transaction = await contract.buymeacoffee(
        profileAddress, 
        { value: ethers.utils.parseEther(eth_price) }
        );

      // Disable form
      this.formTarget.classList.add("pointer-events-none");
  
      // Show notification
      this.showNotification("Processing...", "We are almost there.");
  
      // console.log("Processing...", transaction.hash);
      await transaction.wait();
      // alert("Transaction successful!");
      this.showNotification("Success", "Your coffee is on its way!");
  
      // reload the whole page
      window.location.reload();
    }
    catch (error) {
      console.log(error);
      alert("Transaction failed!");
    }
  }


  async getAllCoffee() {
    try {
      transactions = await contract.getAllCoffee();
      console.log(transactions);

      this.resultsTarget.innerText = "";
      transactions
        .slice(0)
        .reverse()
        .map((txn) => {
          this.addResultItem(txn);
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  async getContractBalance() {
    try {
      let contractBalance = await contract.getBalance();
      contractBalance = ethers.utils.formatEther(contractBalance);
      contractBalance = Math.round(contractBalance * 10000) / 10000;

      // console.log("Contract's balance: ", contractBalance);

      if (contractBalance > 0) {
        this.withdrawTarget.innerText = `Withdraw ${contractBalance} ETH`;
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

    const tx_eth = ethers.utils.formatEther(txn.amount);
    const tx_address = `${txn.supporter.slice(0, 6)}...${txn.supporter.slice(
      -3
    )}`.toUpperCase();
    const tx_date = new Date(txn.timestamp.toNumber() * 1000).toLocaleString(
      "en-US"
    );

    item.querySelector(".supporter").innerText = txn.name;
    item.querySelector(".message").innerText = txn.message;
    item.querySelector(".price").innerText = `supported ${tx_eth} ETH`;
    item.querySelector(".address").innerText = tx_address;
    item.querySelector(".timestamp").innerText = tx_date;

    this.resultsTarget.append(item);
  }

  

}
