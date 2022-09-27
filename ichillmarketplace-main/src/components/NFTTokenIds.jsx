import TotalNFT from "./TotalNFT";
import Banner from "./banner";
import BannerNFT from "./BannerNFT";
import React, { useState, useEffect } from "react";
import { getCollectionsByChain } from "helpers/collections";
import {
  useMoralisQuery,
} from "react-moralis";
import { Card, Image, Tooltip, Badge, Alert } from "antd";
import { useNFTTokenIds } from "hooks/useNFTTokenIds";
import {
  FileSearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getExplorer } from "helpers/networks";
import axios from 'axios';
import { useIPFS } from "hooks/useIPFS";
import { useHistory } from "react-router";
const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    margin: "0 auto",
    maxWidth: "1250px",
    gap: "10px",
  },
  banner: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: "0 auto",
    width: "600px",
    //borderRadius: "10px",
    height: "150px",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "solid 1px #e3e3e3",
  },
  logo: {
    height: "115px",
    width: "115px",
    borderRadius: "50%",
    // positon: "relative",
    // marginTop: "-80px",
    border: "solid 4px white",
  },
  text: {
    color: "#041836",
    fontSize: "27px",
    fontWeight: "bold",
  },
};
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
function NFTTokenIds({ inputValue, setInputValue }) {
  const { chainId, contractABI } = useMoralisDapp();
  const contractABIJson = JSON.parse(contractABI);
  const NFTCollections = getCollectionsByChain(chainId);
  const fallbackImg = "./tumblr_oxe.jpg";
  const { NFTTokenIds, totalNFTs, fetchSuccess } = useNFTTokenIds(inputValue);
  const queryMarketItems = useMoralisQuery("MarketItems");
  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "objectId",
      "createdAt",
      "price",
      "nftContract",
      "itemId",
      "sold",
      "tokenId",
      "seller",
      "owner",
      "confirmed",
    ])
  );
  const [listNFT, setListNFT] = useState([])
  const [pgListNFT, setPgListNFT] = useState(null)
  const { resolveLink } = useIPFS();
  const [pagesize, setPageSize] = useState(0);
  const [page, setPage] = useState(0)
  const [pgm, setPgm] = useState(1)
  const getNFT = (pg) => {
    setPage(0)
    setPgm(pgm)
    axios.post(SERVER_URL + '/functions/getAllTokenIds', {
      "chain": chainId,
      "address": inputValue,
      "limit": 100,
      "range": pg,
      "cursor": localStorage.getItem('cursor') != "null" ? localStorage.getItem('cursor') : null
    })
      .then(res => {
        // setCursor(res.data?.result?.cursor);
        if (res.data?.result?.cursor) {
          localStorage.setItem('cursor', res.data?.result?.cursor)
        }
        setPgListNFT(res.data?.result?.result)
        setPageSize(res.data?.result?.page)
      })
  }
  const [txtsearch, setTxtSearch] = useState('')
  const searchNFT = () => {
    setPage(0)
    setPgm(pgm)
    if (txtsearch.length > 0) {
      axios.post(SERVER_URL + '/functions/searchNFTs', {
        "chain": chainId,
        "token_address": inputValue,
        "q": txtsearch
      })
        .then(res => {
          setPgListNFT(res.data?.result?.result)
          setPageSize(res.data?.result?.page)
        })
    } else {
      setListNFT(NFTTokenIds)
    }
  }
  useEffect(async () => {
    if (pgListNFT) {
      const NFTs = pgListNFT;
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        } else if (NFT?.token_uri) {
          try {
            await fetch(NFT.token_uri)
              .then((response) => response.json())
              .then((data) => {
                NFT.image = resolveLink(data.image);
              });
          } catch (error) {
          }
        }
      }
      setListNFT(NFTs);

    }
  }, [pgListNFT]);

  useEffect(() => {
    localStorage.setItem('cursor', 'null')
    getNFT(0)
  }, [NFTTokenIds])

  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        e.nftContract === nft?.token_address &&
        e.tokenId === nft?.token_id &&
        e.sold === false &&
        e.confirmed === true

    );
    return result;
  };
  const history = useHistory();
  const buyNFT = (nft)=>{
    const price = getMarketItem(nft)
    if(price){
      history.push('/infoNFT?id='+nft.token_id+'&adress='+nft.token_address+'&price='+price.price / ("1e" + 18));
    }else{
      history.push('/infoNFT?id='+nft.token_id+'&adress='+nft.token_address+'&price=0');
    }
  }
  return (
    <div style={{width: '100%'}}>
      {inputValue === "explore" && <BannerNFT />}
      <div style={{ display: 'block' }}>
        <div>
          {contractABIJson.noContractDeployed && (
            <>
              <Alert
                message="No Smart Contract Details Provided. Please deploy smart contract and provide address + ABI in the MoralisDappProvider.js file"
                type="error"
              />
              <div style={{ marginBottom: "10px" }}></div>
            </>
          )}
          {inputValue === "explore" && <h2 className="TopCollections_title">Collections</h2>}
          <div style={styles.NFTs}>
            {inputValue === "explore" &&
              NFTCollections?.map((nft, index) => (
                <div className="CollectionItem_root" onClick={() => setInputValue(nft?.addrs)}>
                  <span className="spanItem">
                    <span className="spanItem2">
                    </span>
                    <img alt="" src='./avatar.png' decoding="async" height='200' data-nimg="responsive" className="CollectionItem_image" />
                  </span>
                  <div className="CollectionItem_info">
                    <div className="Avatar_root SquareAvatar_avatar">
                      <span className="sapnAvatar">
                        <img src={nft?.image || "error"} decoding="async" data-nimg="fill" sizes="100vw" className="imgAvatar" />
                      </span>
                    </div>
                    <div className="CollectionItem_titleAndAuthor ml">
                      <p className="CollectionItem_title">{nft?.name}</p>
                    </div>
                  </div>
                  {/* <TotalNFT inputValue={nft.addrs} /> */}
                </div>
              ))
              }
           
          </div>
          <div>
          {inputValue !== "explore" && (
            <>
              {!fetchSuccess && (
                <div style={{width:'80%', margin:'auto'}}>
                  <Alert
                    message="Unable to fetch all NFT metadata... We are searching for a solution, please try again later!"
                    type="warning"
                  />
                  <div style={{ marginBottom: "10px" }}></div>
                </div>
              )}
              <div style={styles.banner}>
                <Image
                  preview={false}
                  src={NFTTokenIds[0]?.image || "error"}
                  fallback={fallbackImg}
                  alt=""
                  style={styles.logo}
                />
                <div style={styles.text}>
                  <>
                    <div  style={{color: "#FFF"}}>{`${NFTTokenIds[0]?.name}`}</div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#FFF",
                        fontWeight: "normal",
                      }}
                    >
                      Collection Size: {`${totalNFTs}`}
                    </div>
                  </>
                </div>
              </div>
            </>
          )}
          <div style={{ margin: '30px' }}>
            {inputValue !== "explore" && <div className="divSearch">
              <input type="text" onChange={(event) => setTxtSearch(event.target.value)} placeholder='Search by name NFT' className="inputsearch" />
              <button onClick={searchNFT} className="btnsearch">Search</button>
            </div>}
            {txtsearch.length < 3 && txtsearch.length > 0 && inputValue !== "explore" && <p className="perror">input least 3 characters</p>}
          </div>
          <div style={styles.NFTs}>
            {inputValue !== "explore" && listNFT.length > 0 &&
              listNFT.slice(page, page + 25).map((nft, index) => (
                <Card
                  hoverable
                  actions={[
                    <Tooltip title="View On Blockexplorer">
                      <FileSearchOutlined
                        onClick={() =>
                          window.open(
                            `${getExplorer(chainId)}address/${nft.token_address}`,
                            "_blank"
                          )
                        }
                      />
                    </Tooltip>,
                    <Tooltip title="Buy NFT">
                      <ShoppingCartOutlined onClick={() => buyNFT(nft)} />
                    </Tooltip>,
                  ]}
                  style={{ width: 240, border: "2px solid #e7eaf3", borderRadius:'10px' }}

                  cover={
                    <>
                      {
                        nft.metadata?.name?.split('.')[1] === 'mp4' || nft.metadata?.name?.split('.')[1] === 'webm' ?  (
                          <video src={nft.metadata?.image} width='290' height='250' autoPlay loop muted style={{ borderRadius: '10px', padding: '5px',borderRadius:'10px'  }} onClick={() => buyNFT(nft)}></video>
                        ) : (
                          <Image
                            preview={false}
                            src={resolveLink(nft.metadata?.image) || "error"}
                            fallback={fallbackImg}
                            alt=""
                            style={{ height: "240px", padding: '5px',borderRadius:'10px'  }}
                            onClick={() => buyNFT(nft)}
                          />
                        )
                      }
                    </>
                  }
                  key={index}
                >
                  {getMarketItem(nft) && (
                    <Badge.Ribbon text="Buy Now" color="green"></Badge.Ribbon>
                  )}
                  <Meta title={nft.metadata?.name} description={`#${nft.token_id}`} />
                </Card>
              ))}
          </div>
        </div>
        {inputValue != "explore" && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          {listNFT.length > 0 && <button style={{ margin: '5px', background: page === 0 ? '#13c1dd' : 'white', border: 'unset' }} onClick={() => setPage(0)}>1</button>}
          {listNFT.length > 25 && <button style={{ margin: '5px', background: page === 25 ? '#13c1dd' : 'white', border: 'unset' }} onClick={() => setPage(25)}>2</button>}
          {listNFT.length > 50 && <button style={{ margin: '5px', background: page === 50 ? '#13c1dd' : 'white', border: 'unset' }} onClick={() => setPage(50)}>3</button>}
          {listNFT.length > 75 && <button style={{ margin: '5px', background: page === 75 ? '#13c1dd' : 'white', border: 'unset' }} onClick={() => setPage(75)}>4</button>}
          {(pagesize * 100 + 100 < totalNFTs) && <button className="onclick" onClick={() => getNFT(pgm + 1)}>Next Page</button>}
        </div>}
          {inputValue === "explore" && <Banner />}
        </div>
      </div>
    </div>
  );
}

export default NFTTokenIds;

