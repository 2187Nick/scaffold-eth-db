import { Button, Divider, Input, List, Select} from "antd";
import React, { useState, useEffect} from "react";
import { Address} from "../components";
import { Deta } from "deta";
require("dotenv").config();
const dbkey = process.env.REACT_APP_PROJECT_KEY

function Home({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [searchMessage, setSearchMessage] = useState("");
  const [requestedData, setRequestedData] = useState([]);
  const [allMessages, setAllMessages] = useState([])
  const [newDatabase, setNewDatabase] = useState("")
  const [selectDatabase, setSelectDatabase] = useState("FirstDB");
  const [databaseList1, setDatabaseList1] = useState(["FirstDB"]);
  const { Option } = Select;

  useEffect(() => {
    async function getDatabases() {
      if(window.localStorage.getItem("databases")){
        const databases1 = JSON.parse(window.localStorage.getItem("databases"));
        setDatabaseList1(databases1)
      }
    }
    getDatabases();
    
  }, []);

  const deta = Deta(dbkey)
  // Set your Database name
  const database = deta.Base(selectDatabase)

  return (
    <div>
        <div style={{ margin: 8 }}>
        <div>
          <b>Select Database</b> 
        </div>
          <Select
            showSearch
            value={selectDatabase}
            onChange={value => {
              console.log(`selected ${value}`);
              setSelectDatabase(value);
            }}
            filterOption={(input, option) => option.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        
          >
            {databaseList1.map(token => (
              <Option key={token} value={token}>
                {token}
              </Option>
            ))}
          </Select>
        </div>
      
        <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <h2>Write Message Here:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setNewPurpose(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {

              const result = tx(writeContracts.YourContract.setPurpose(newPurpose),async update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );

                  // Add the data to the database
                  await database.put({sender: update.from, message: newPurpose, /*time: update.timeStamp,*/ gasUsed: parseInt(update.gasUsed['_hex']), blockNumber: update.blockNumber});
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Send Message
          </Button>
        </div>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        </div>

        <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <h2>Fetch All Data from the Database:</h2>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {

              const data = await database.fetch();
              console.log("alldata: ", data)
              const allItems = data.items;
              console.log("allItems: ", allItems)

              setAllMessages(allItems)
            }}
          >
            Fetch Data
          </Button> <br></br><br></br>
        
          <h2>Database Data:</h2>
          <List
            bordered
            dataSource={allMessages}
            size="large"
            renderItem={item => {
              return (
                <List.Item key={item.blockNumber} >
                Message: {item.message}<br></br>
                Block: {item.blockNumber} <br></br>
                Sender: {item.sender} <br></br>
                Gas Used: {item.gasUsed}
        
                </List.Item>
              );
            }}
          />
        
          </div>
          <Divider />

        <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <h2>Enter Message to get Details:</h2>
        
        <Divider />
        
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setSearchMessage(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
   
              const data = await database.fetch();
              console.log("alldata: ", data)
              const allItems = data.items;
              console.log("allItems: ", allItems)

              const dataArray = []
              allItems.map((data) => {
                if (data.message == searchMessage) {
                  dataArray.push(data)
                  setRequestedData(dataArray)
                }
              }) 
            }}
          >
            Search Database
          </Button> <br></br>
          <h2>Details:</h2><br></br>
          <List
            bordered
            dataSource={requestedData}
            size="large"
            renderItem={item => {
              return (
                <List.Item key={item.blockNumber} >
                Block Number: {item.blockNumber}<br></br><br></br>
                <div>Sender: {item.sender}</div><br></br>
                <div>Gas Used: {item.gasUsed} </div>

                </List.Item>
              );
            }}
          /> <br></br><br></br>
        </div>
        </div> 
        <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <h2>Create New Database:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setNewDatabase(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              databaseList1.push(newDatabase)
              setDatabaseList1(databaseList1)
              window.localStorage.setItem("databases", JSON.stringify(databaseList1));
            }}
          >
            Create
          </Button><br></br><br></br><br></br><br></br><br></br><br></br>
        </div>
       
        </div><br></br>
      
    </div>
  );
}


export default Home;
