import { ethers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== undefined) {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    const accounts = await ethereum.request({ method: "eth_accounts" })
    connectButton.innerHTML = "Connected!"
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install Metamask!"
  }
}

// Get Balance function
async function getBalance() {
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

// Fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== undefined) {
    // provider / connect to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // signer
    const signer = provider.getSigner()
    // contract that we are interacted with
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // listen for the tx to be mined
      await listenForTransactionMined(transactionResponse, provider)
      console.log("Done!")
      // listed for an event
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTransactionMined(transactionResponse, provider) {
  console.log(`Mining: ${transactionResponse.hash}...`)
  return new Promise((resolve, reject) => {
    // listen for this transaction to finish
    // create a listener for the blockchain
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Complete with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}

// Withdraw function
async function withdraw() {
  if (typeof window.ethereum !== undefined) {
    console.log("Withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMined(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
