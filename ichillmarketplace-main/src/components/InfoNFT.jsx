import React, { useState, useEffect } from "react";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import axios from 'axios';
import { useIPFS } from "hooks/useIPFS";
import {
    useMoralis,
    useMoralisQuery,
} from "react-moralis";
import { Modal, Alert, Spin } from "antd";
import { useWeb3ExecuteFunction } from "react-moralis";
import { useHistory } from "react-router";
import { PolygonLogo } from "./Chains/Logos";
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

function InfoNFT() {
    const queryParams = new URLSearchParams(window.location.search);
    const { chainId } = useMoralisDapp();
    const id = queryParams.get('id');
    const adrr = queryParams.get('adress');
    const price = queryParams.get('price');
    const [meta, setMeta] = useState(null)
    const [datas, setData] = useState(null)
    const { resolveLink } = useIPFS();
    const [pricer, setPrice] = useState(0);
    const getData = () => {
        axios.post(SERVER_URL + '/functions/getTokenIdMetadata/', {
            "address": adrr,
            "token_id": id,
            "chain": chainId
        })
            .then(res => {
                if (res.status === 200) {
                    setData(res?.data?.result)
                }
            })
    }
    useEffect(() => {
        getData()
    }, [chainId, id, adrr])

    useEffect(async () => {
        const NFT = datas;
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
        setMeta(NFT);
    }, [datas]);

    const [visible, setVisibility] = useState(false);
    const [nftToBuy, setNftToBuy] = useState(null);
    const [loading, setLoading] = useState(false);
    const contractProcessor = useWeb3ExecuteFunction();
    const { marketAddress, contractABI, walletAddress } =
        useMoralisDapp();
    const contractABIJson = JSON.parse(contractABI);
    const { Moralis } = useMoralis();
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
    const purchaseItemFunction = "createMarketSale";
    async function purchase() {
        setLoading(true);
        const tokenDetails = getMarketItem(meta);
        const itemID = tokenDetails.itemId;
        const tokenPrice = tokenDetails.price;
        const ops = {
            contractAddress: marketAddress,
            functionName: purchaseItemFunction,
            abi: contractABIJson,
            params: {
                nftContract: meta.token_address,
                itemId: itemID,
            },
            msgValue: tokenPrice,
        };
        await contractProcessor.fetch({
            params: ops,
            onSuccess: () => {
                console.log("success");
                setLoading(false);
                setVisibility(false);
                updateSoldMarketItem();
                succPurchase();
            },
            onError: (error) => {
                setLoading(false);
                failPurchase();
            },
        });
    }
    function succPurchase() {
        let secondsToGo = 5;
        const modal = Modal.success({
            title: "Success!",
            content: `You have purchased this NFT`,
        });
        setTimeout(() => {
            modal.destroy();
            history.push('/nftBalance');
        }, secondsToGo * 1000);
    }
    function failPurchase() {
        let secondsToGo = 5;
        const modal = Modal.error({
            title: "Error!",
            content: `There was a problem when purchasing this NFT`,
        });
        setTimeout(() => {
            modal.destroy();
        }, secondsToGo * 1000);
    }
    async function updateSoldMarketItem() {
        const id = getMarketItem(meta).objectId;
        const marketList = Moralis.Object.extend("MarketItems");
        const query = new Moralis.Query(marketList);
        await query.get(id).then((obj) => {
            obj.set("sold", true);
            obj.set("owner", walletAddress);
            obj.save();
        });
    }

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
    const listItemFunction = "createMarketItem";
    const ItemImage = Moralis.Object.extend("ItemImages");
    async function list(nft, listPrice) {
        setLoading(true);
        const p = listPrice * ("1e" + 18);
        const ops = {
            contractAddress: marketAddress,
            functionName: listItemFunction,
            abi: contractABIJson,
            params: {
                nftContract: nft.token_address,
                tokenId: nft.token_id,
                price: String(p),
            },
        };

        await contractProcessor.fetch({
            params: ops,
            onSuccess: () => {
                setLoading(false);
                setVisibility(false);
                addItemImage();
                succList();
            },
            onError: (error) => {
                setLoading(false);
                failList();
            },
        });
    }
    const history = useHistory();
    async function approveAll(nft) {
        setLoading(true);
        const ops = {
            contractAddress: nft.token_address,
            functionName: "setApprovalForAll",
            abi: [{ "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
            params: {
                operator: marketAddress,
                approved: true
            },
        };
        await contractProcessor.fetch({
            params: ops,
            onSuccess: () => {
                list(meta, pricer);
            },
            onError: (error) => {
                setLoading(false);
                failApprove();
            },
        });
    }
    function succList() {
        let secondsToGo = 5;
        const modal = Modal.success({
            title: "Success!",
            content: `Your NFT was listed on the marketplace`,
        });
        setTimeout(() => {
            modal.destroy();
            window.location.reload()
        }, secondsToGo * 1000);
    }
    function failList() {
        let secondsToGo = 5;
        const modal = Modal.error({
            title: "Error!",
            content: `There was a problem listing your NFT`,
        });
        setTimeout(() => {
            modal.destroy();
        }, secondsToGo * 1000);
    }
    function failApprove() {
        let secondsToGo = 5;
        const modal = Modal.error({
            title: "Error!",
            content: `There was a problem with setting approval`,
        });
        setTimeout(() => {
            modal.destroy();
        }, secondsToGo * 1000);
    }
    function addItemImage() {
        const itemImage = new ItemImage();
        itemImage.set("image", meta.image);
        itemImage.set("nftContract", meta.token_address);
        itemImage.set("tokenId", meta.token_id);
        itemImage.set("name", meta.name);
        itemImage.save();
    }
    const [show, setShow] = useState(false)
    return (
        <div style={{ display: 'block', width: '100%' }}>
            <h4 style={{ width: '70%', margin: 'auto' }} className='titleInfo'>{!price ? 'Sell NFT 🖼 ': 'Buy NFT 🛒'}</h4>
            <div style={{ width: '70%', margin: 'auto' }} className='dflex infoNFt'>
                <div >
                    <div className="border-ras" >
                        <Spin spinning={loading} >

                            {
                                meta?.metadata?.name?.split('.')[1] === 'mp4' || meta?.metadata?.name?.split('.')[1] === 'webm' ? (
                                    <video src={meta?.image} style={{ height: '265px', width: '100%', margin: 'auto' }} autoPlay loop muted onClick={() => setShow(true)}></video>
                                ) : (
                                    <img src={meta?.image} alt="" style={{ margin: 'auto', height: '265px' }} onClick={() => setShow(true)} />
                                )
                            }

                        </Spin>

                    </div>

                    <div className="border-des mt-5">
                        <p className="box" style={{ textAlign: 'center', color: '#47a2f7', fontSize: '25px' }}>{meta?.metadata?.name}</p>
                        <div className="dflex">
                            <label className="boxx">Price:</label>
                            {
                                !price ? (<input type='text' className="inputstyle" placeholder="Price in Matic ..." onChange={(event) => setPrice(event.target.value)} />) : (<span className="spanstyle" >{price} MATIC</span>)
                            }
                            <PolygonLogo  />
                        </div>
                    </div>
                </div>
                <div className="border-des ml">
                    <label className="box" style={{borderBottom: 'none'}}>Description: </label>
                    <p className="txt" style={{width:'90%', margin:'auto'}}>{meta?.metadata?.description}</p>
                    <hr />
                    <span className="box">About:  <p style={{ paddingLeft: '10px', color: '#47a2f7' }}>{meta?.name}</p></span>
                    <label className="box" style={{borderBottom: 'none'}}>Details</label>
                    <div className="details">
                        <div style={{ display: 'grid', width: '40%' }}>
                            <span className="txt">Constract Address:</span>
                            <span className="txt">TokenID:</span>
                            <span className="txt">Token Standand: </span>
                            <span className="txt">Chain: </span>
                        </div>
                        <div style={{ display: 'grid', width: '60%' }}>
                            <span className="txt">{meta?.token_address.slice(0, 5)}...{meta?.token_address.slice(36, 42)}</span>
                            <span className="txt">{meta?.token_id}</span>
                            <span className="txt">{meta?.contract_type}</span>
                            <span className="txt">{chainId}</span>
                        </div>
                    </div>
                </div>


            </div >
            <div style={{ width: '70%', margin: 'auto', marginTop: '20px' }} >
                {
                    price === '0' ? (
                        <Alert style={{ textAlign: 'center' }}
                            message="This NFT is currently not for sale"
                            type="warning"
                        />
                    ) : (
                        price ? (
                            <>
                                <Spin spinning={loading}>
                                    <button className="buy-btn" onClick={() => purchase()}>Buy</button>
                                </Spin >
                            </>
                        ) : (
                            <>
                                <Spin spinning={loading}>
                                    <button className="buy-btn" disabled={pricer === 0} onClick={() => approveAll(meta)}>Sell</button>
                                </Spin >
                            </>
                        )
                    )
                }
            </div>
            {show ? (
                <Modal
                    title={`${meta?.name} #${meta?.token_id}`}
                    visible={show}
                    onCancel={() => setShow(false)}
                    onOk={() => setShow(false)}>
                    <div
                        style={{
                            width: "70%",
                            margin: "auto",
                        }}>
                        <>
                            {
                                meta?.metadata?.name?.split('.')[1] === 'mp4' || meta?.metadata?.name?.split('.')[1] === 'webm' ? (
                                    <video src={meta?.metadata?.image}  controls muted style={{ borderRadius: '10px', padding: '5px',width: "100%",margin:'auto', }}></video>
                                ) : (
                                    <img
                                        src={meta?.image}
                                        style={{
                                            width: "80%",
                                            margin:'auto',
                                            borderRadius: "10px",
                                            marginBottom: "15px",
                                        }} />
                                )
                            }
                        </>
                    </div>
                </Modal>
            ) : []}
        </div>
    );
}

export default InfoNFT;
