import React from "react";
import { useState } from "react";
import { useContext } from 'react'
import axios from 'axios'
import { Web3Context } from "./Web3Provider";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { Alert, Modal, Spin } from "antd";
import { useNFTBalance } from "hooks/useNFTBalance";
function CreateNft() {
    const { NFTBalance, fetchSuccess } = useNFTBalance();
    const { walletAddress } = useMoralisDapp();
    const [urlFile, setUrlFile] = useState(null);
    const [type, setType] = useState(null);
    const [file, setFile] = useState(null);
    const [name, setName] = useState(null);
    const [decs, setDecs] = useState('');
    const [falseRoi, setFalseRoi] = useState(false)
    async function uploadFileToIPFS() {
        var formData = new FormData()
        formData.append('file', file)
        formData.append('duration', 525)
        formData.append('file_type', 1)
        formData.append('wallet_address', walletAddress)
        const { data } = await axios.post('https://calibration-mcs-api.filswan.com/api/v1/storage/ipfs/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        const form = {
            name: name,
            image: data.data.ipfs_url,
            description: decs,
            tx_hash: '',
            attributes: [{ trait_type: 'Size', value: parseInt(data.data.file_size) }],
            external_url: data.data.ipfs_url
        }
        return form
    }
    async function jsonFile() {
        setLoading(true)
        setFalseRoi(false)
        const dt = await uploadFileToIPFS()
        const fileBlob = new Blob([JSON.stringify(dt)], {
            type: 'application/json',
        })
        var formData1 = new FormData()
        formData1.append('file', fileBlob, `${name}.json`)
        formData1.append('duration', 525)
        formData1.append('file_type', 1)
        formData1.append('wallet_address', walletAddress)
        const { data } = await axios.post('https://calibration-mcs-api.filswan.com/api/v1/storage/ipfs/upload', formData1, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        console.log(data)
        onSubmit(data.data.ipfs_url)
    }
    async function onFileChange(event) {
        if (!event.target.files[0]) return
        setUrlFile(URL.createObjectURL(event.target.files[0]))
        setType(event.target.files[0].type.split("/")[0])
        setFile(event.target.files[0])
        setName(event.target.files[0].name)
    }
    const { nftContract } = useContext(Web3Context)
    const [isLoading, setIsLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    async function createNft(metadataUrl) {
        const transaction = await nftContract.mintToken(metadataUrl)
        const tx = await transaction.wait()
        const event = tx.events[0]
        const tokenId = event.args[2]
        return tokenId
    }
    function succPurchase() {
        let secondsToGo = 5;
        const modal = Modal.success({
            title: "Success!",
            content: `You  Min NFT success`,
        });
        setTimeout(() => {
            modal.destroy();
            window.location.reload()
        }, secondsToGo * 1000);
    }
    function failPurchase() {
        let secondsToGo = 5;
        const modal = Modal.error({
            title: "Error!",
            content: `There was a problem when Min NFT`,
        });
        setTimeout(() => {
            modal.destroy();
        }, secondsToGo * 1000);
    }
    async function onSubmit(url) {
        try {
            if (!file || isLoading) return;//toast.success("Min NFT False!");
            setIsLoading(true)
            const tokenId = await createNft(url)
        } catch (error) {
            setLoading(false)
            setFalseRoi(true)
            failPurchase()
        } finally {
            setLoading(false)
            succPurchase()
        }
    }
    return (
        <>
            {falseRoi && <div style={{ width: '70%', margin: 'auto', textAlign:'center' }}>
                <Alert
                    message="Error: There was a problem when Min NFT"
                    type="error"
                />
                <div style={{ marginBottom: "10px" }}></div>
            </div>}
            <div className="divupload">
                <div className="Upload_root">
                    <div className="Upload_title">Upload NFT</div>
                    <div className="Upload_description">You can set preferred display name, create your profile URL and manage other personal settings.</div>
                    <div className="UploadForm_root" >
                        <Spin spinning={loading} >
                            <div>
                                <fieldset className="UploadForm_fieldset">
                                    <div className="FormField_root UploadForm_upload">
                                        <label className="FormLabel_root UploadForm_uploadLabel">Upload file</label>
                                        <div className="form-group file-area">
                                            <input className="inputStyle" type="file" name="images" id="images" required="required" style={{ outline: 'none' }} onChange={onFileChange} />
                                            <div className="file-dummy">
                                                <div className="success">{name ? name : 'Choose File Your Want Upload'} </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="FormField_root UploadForm_name">
                                    <label className="FormLabel_root" >Item name</label>
                                    <div className="FormInput_root">
                                        <input className="FormInput_input" placeholder="Enter a name" id="name" name="name" onChange={uploadFile} />
                                    </div>
                                </div> */}
                                    <div className="FormField_root UploadForm_description">
                                        <label className="FormLabel_root" >Description</label>
                                        <div className="FormInput_root FormInput_textarea">
                                            <textarea className="FormInput_input FormInput_textareaInput" placeholder="Enter a description" id="description" name="description" onChange={event => setDecs(event.target.value)}>
                                            </textarea>
                                        </div>
                                    </div>
                                </fieldset>
                                <div className="UploadForm_actions">
                                    <button className="Button_root Button_variant-secondary" type="button" >Cancel</button>
                                    <button className="Button_root Button_variant-primary" type="submit" onClick={jsonFile} disabled={!urlFile}>Create Item</button>

                                </div>

                            </div>
                        </Spin>

                    </div>
                </div>
                <div className="UploadForm_preview">
                    <div className="FormField_root">
                        <label className="FormLabel_root">Preview</label>
                        <Spin spinning={loading} >
                            <div className="CardItem_root">
                                <div className="CardItem_mediaContainer">
                                    <div className="CardMedia_root CardItem_media">
                                        <div className="CardMedia_content" >
                                            {
                                                type === 'image' ? <img src={urlFile} alt="" width='290' /> : []
                                            }
                                            {
                                                type === 'video' ? <video src={urlFile} width='290' autoPlay loop muted ></video> : []
                                            }

                                        </div>
                                    </div>
                                </div>
                                <div className="CardItem_topline">
                                    <div className="CardItem_collectionAndName">
                                        <div className="CardItem_collection">Name</div>
                                        <div className="CardItem_name">{(name + '').length > 20 ? name?.slice(0, 20) : name}</div>
                                    </div>
                                </div>
                                <div className="CardItem_bottom">
                                    <div className="CardItem_authorAndPrice">
                                        <div className="CardItem_author">{walletAddress?.slice(0, 5) + '...' + walletAddress?.slice(38, 42)}</div>
                                        <div className="CardItem_price">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="ChainIcon_root__Mp3av CardItem_chainIcon__uIEts">
                                                <path d="M10.6005 4.93152C10.3446 4.7853 10.0157 4.7853 9.72324 4.93152L7.67624 6.13778L6.28721 6.90541L4.27676 8.11167C4.02089 8.25789 3.69191 8.25789 3.39948 8.11167L1.82768 7.16128C1.5718 7.01507 1.38903 6.72264 1.38903 6.39366V4.56598C1.38903 4.27355 1.53525 3.98113 1.82768 3.79836L3.39948 2.88452C3.65535 2.73831 3.98433 2.73831 4.27676 2.88452L5.84856 3.83491C6.10444 3.98113 6.28721 4.27355 6.28721 4.60254V5.8088L7.67624 5.00462V3.7618C7.67624 3.46938 7.53003 3.17695 7.2376 2.99418L4.31332 1.27616C4.05744 1.12995 3.72846 1.12995 3.43603 1.27616L0.438642 3.03073C0.146214 3.17695 0 3.46938 0 3.7618V7.19783C0 7.49026 0.146214 7.78269 0.438642 7.96546L3.39948 9.68348C3.65535 9.82969 3.98433 9.82969 4.27676 9.68348L6.28721 8.51376L7.67624 7.70958L9.68668 6.53987C9.94256 6.39366 10.2715 6.39366 10.564 6.53987L12.1358 7.45371C12.3916 7.59992 12.5744 7.89235 12.5744 8.22133V10.049C12.5744 10.3414 12.4282 10.6339 12.1358 10.8166L10.6005 11.7305C10.3446 11.8767 10.0157 11.8767 9.72324 11.7305L8.15144 10.8166C7.89556 10.6704 7.71279 10.378 7.71279 10.049V8.8793L6.32376 9.68348V10.8897C6.32376 11.1822 6.46997 11.4746 6.7624 11.6574L9.72324 13.3754C9.97911 13.5216 10.3081 13.5216 10.6005 13.3754L13.5614 11.6574C13.8172 11.5112 14 11.2187 14 10.8897V7.41716C14 7.12473 13.8538 6.8323 13.5614 6.64953L10.6005 4.93152Z" fill="currentColor"></path>
                                            </svg>
                                            <span className="CardItem_priceEther">0 MATIC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Spin>

                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateNft

