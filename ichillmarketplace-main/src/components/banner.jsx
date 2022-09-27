export default function Banner() {
    return (
        <div className="Banner_root">
            <div className="Banner_card">
                <div className="Banner_image">
                    <span className='spanBanner'>
                        <img alt="image" src="./banner.webp" decoding="async" data-nimg="fill" sizes="100vw" className='imageBanner' />
                    </span>
                </div>
                <div className="Banner_imageMobile">
                    <span className='spanText'>
                        <span className='spanTxtImg'>
                            <img alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%272554%27%20height=%272169%27/%3e" className='span-sgv' />
                        </span>
                        <img alt="image" src="./banner.webp" decoding="async" data-nimg="intrinsic" className='sgv-css' />
                    </span>
                </div>
                <div className="Banner_content">
                    <div className="Banner_title">Create NFT greeting cards</div>
                    <div className="Banner_description">Register as a creator and start make money selling your artworks</div>
                </div>
            </div>
        </div>
    )
}