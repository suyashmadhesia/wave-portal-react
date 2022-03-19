import React, { useEffect, useState, useLayoutEffect } from 'react';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json"
import './App.css';

const App = () =>{

  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [loadingState, setLoading] = useState(false);
    
  const checkIfWalletIsConnected = async () => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Make sure you have metamask!");
      }
      else{
        console.log("We have the ethereum object", ethereum);
      }
  
      const accounts = await ethereum.request({
        method:"eth_accounts"
      });
  
      if(accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorized account", account);
        setCurrentAccount(account);
      }
      else{
        console.log("No authorized account found");
      }
    }catch(error){
      console.log(error);
      
    }
  }

  const connectWallet = async ()=>{
    try{
      const{ethereum} = window;
      if (!ethereum){
        alert("Get Metamask");
      }
      const accounts = await ethereum.request({
        method:"eth_requestAccounts"
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      
    }
    catch(error){
      console.log(error);
    }
  }

  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x84a36d96eEA0c1602F68654FCbBeab19F55DC2a0";
  const contractABI = abi.abi;

  const wave = async() => {
    try {
      const { ethereum } = window;
      if (ethereum){
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        // let count = await wavePortalContract.getTotalWaves();
        // console.log("Total waves", count.toNumber());

        // Writing to the blockchain
        if(message===""){
          setMessage("Hello ! How are you !")
        }
        // document.getElementsByClassName("input-field").innerHTML="";
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        getAllWaves();
        // count = await wavePortalContract.getTotalWaves();
        // console.log("Retrieved total wave count...", count.toNumber());
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      alert("Something went wrong !! Wallet not connect. If wallet is connected make sure it is connected to Rinkeby testnet.")
      console.log(error);
    }
  }

  const getAllWaves = async() => {
    try{
      
        const RPC = "https://rinkeby.infura.io/v3/b2903e0fea0a41a5b165a940eedab4b2";
        const provider = new ethers.providers.JsonRpcProvider(RPC);
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

      const waves = await wavePortalContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        });
        setAllWaves(wavesCleaned);
      
    } catch(e){
      console.log(e);
    }
  }

  function handleChange(event) {
    setMessage(event.target.value);
  }

  const btnName = "Send Message";

  useEffect(()=>{
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          Myself Suyash and I am an engineer and a full stack developer !!
        </div>
        <div>
          <textarea className="input-field" onChange={handleChange} placeholder="Write message to me....."></textarea>
        </div>
        <button className="waveButton" onClick={wave}>
          {
            loadingState ? <div className="loader"></div> :btnName
          }
        </button>
        {
          !currentAccount && (
            <button className="btn connect" onClick={connectWallet}>Connect Wallet</button>
          )
        }
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "#f5f5f5", marginTop: "16px", padding: "8px" }}>
              <div>From: {wave.address}</div>
              <div>Message: {wave.message}.</div>
               <div>Time: {wave.timestamp.toString()}</div>
            </div>)
        })}
      </div>
    </div>
  )
}

export default App;