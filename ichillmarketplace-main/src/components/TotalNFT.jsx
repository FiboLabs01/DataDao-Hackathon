import React from "react";

import { useNFTTokenIds } from "hooks/useNFTTokenIds";
import SlideNFT from "./SlideNFT";


function TotalNFT({ inputValue }) {
  const { totalNFTs} = useNFTTokenIds(inputValue);
  return (
    <span className="CollectionItem_nftAmount">{totalNFTs} NFT</span>
  )
}

export default TotalNFT;

