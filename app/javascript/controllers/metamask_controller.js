import { Controller } from "@hotwired/stimulus";
import { ethers } from "ethers";
import abi from "../contract.json" assert { type: "json" };


// constant for the contract address to interact with 
// link to contract: https://goerli.etherscan.io/address/0xc940271b721422572acddf797098f61dbd4bf3f3
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
let isOwner = false;

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
    "walletAddress",
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


      // console.log("Contract is set up successfully", contract);
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
      // console.log("your account address is: " + accounts[0]);

      // Hide connect Metamask button
      this.connectTarget.hidden = true;

      // Show Elements
      this.walletTarget.hidden = false;
      this.resultsTarget.hidden = false;
      this.formTarget.hidden = false;

      this.addressTarget.innerText = `${userAddress.slice( 0, 6)}...${userAddress.slice(-3)}`.toUpperCase(); 
      
      userBalance = await provider.getBalance(userAddress);
      userBalance = ethers.utils.formatEther(userBalance);
      this.balanceTarget.innerText = Math.round(userBalance * 10000) / 10000;
      // console.log("your balance is: " + userBalance + " ETH")

      // Set up smart contract
      await this.setupContract();

      // get the wallet address from the HTML element stored in rails database
      const walletAddress = this.walletAddressTarget.innerText.replace(/\n/g, "");

      // check if the user is the owner
      isOwner = userAddress.toLowerCase() === walletAddress.toLowerCase();
      // console.log("is owner: " + isOwner)

      // show withdraw button if user is owner
      if (isOwner) {
        this.withdrawTarget.hidden = false;
      }

      // get profile coffees
      this.getProfileCoffees(walletAddress);

      // get profile balance
      this.getProfileBalance(walletAddress);

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

  // get csrfToken from rails
  get csrfToken() {
    const metaTag = document.querySelector("meta[name='csrf-token']");
    return metaTag ? metaTag.content : "";
  }
  // method to buy coffee with ETH
  async buyCoffee() {
    try {
      const profileAddress = this.profileAddressTarget.value;
      // console.log(profileAddress)
      const eth_price = this.priceTarget.innerText;


      // execute transaction on the smart contract
      const transaction = await contract.buymeacoffee(
        profileAddress, 
        { value: ethers.utils.parseEther(eth_price) }
        );

      // Save coffee to the Rails database if transaction is successful
      const response = await fetch(`/coffees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-CSRF-Token': this.csrfToken,
        },
        // params.require(:coffee).permit(:author_id, :sender_wallet_address, :name, :amount, :timestamp, :message, :tx_hash)
        body: JSON.stringify({
          coffee: {
            profile_id: 1,
            sender_wallet_address: userAddress,
            name: "Coffee",
            amount: eth_price,
            timestamp: Date.now(),
            message: "Thank you for the coffee!",
            tx_hash: transaction.hash
          }
        }),
      });
      console.log(response)

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

  // method to show the profile balance and the value of the withdraw button
  async getProfileBalance(walletAddress) {
    try {
      let profileBalance = await contract.getProfileBalance(walletAddress);
      profileBalance = ethers.utils.formatEther(profileBalance);
      profileBalance = Math.round(profileBalance * 10000) / 10000;
      // console.log("Profile's balance: ", profileBalance);

      if (profileBalance > 0) {
        this.withdrawTarget.innerText = `Withdraw ${profileBalance} ETH`;
      } else {
        this.withdrawTarget.disabled = true;
        this.withdrawTarget.innerText = "No fund to withdraw";
      }
      return profileBalance;
    } catch (error) {
      console.log(error);
    }
  }

  // method to withdraw the profile balance
  async withdraw() {
    try {
      const transaction = await contract.withdrawProfileBalance()
      // Disable button
      this.withdrawTarget.classList.add("pointer-events-none");
      // Show notification
      this.showNotification("Processing...", "We are almost there.");
      // console.log("Processing...", transaction.hash);
      await transaction.wait();
      // alert("Transaction successful!");
      this.showNotification("Success", "Your funds have been withdrawn!");
      // reload the whole page
      window.location.reload();
    }
    catch (error) {
      console.log(error);
      alert("Transaction failed!");
    }
  }

  // Get profile coffees and display them as messages on the page
  async getProfileCoffees(walletAddress) {
    try {
      transactions = await contract.getCoffeeByProfile(walletAddress);
      // console.log(transactions);

      this.resultsTarget.innerText = "";
      transactions
        .slice(0)
        .reverse()
        .map((txn) => {
          this.addResultItem(txn);
        });
      }
      catch (error) {
        console.log(error);
      }
    }

  // Coffee template get each transaction and display it on the page
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
