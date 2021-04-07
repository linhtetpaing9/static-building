import React from "react"
import config from "../customize/config"
import { TravelCloudClient } from "travelcloud-antd"
import { Banner } from "../components/Utilities/banner"
import { ContactFormComponent } from "../components/Utilities/contact"
import { useOriginalImage } from "../components/Utilities/CommonFunction"

const Page = ({ 
  pageBanners
}) => {

  const bannerPhoto = pageBanners?.photos.find(photo => photo.title.trim().toLowerCase().indexOf('contact-us') > -1) || null

  return (
    <div id="top" className="contact-page">

      {bannerPhoto 
        ? <Banner 
            backgroundImageUrl={useOriginalImage(bannerPhoto.url || "")}
            title={bannerPhoto ? bannerPhoto.title.trim().replace(/\[(.*?)\]/g ,'') : ""}
            subtitle={bannerPhoto ? bannerPhoto.desc : ""}
          />
        : null
      }

      <div className="wrap pad-y">
        <ContactFormComponent 
          heading="Contact Us"
          rowGutter={20}
        />
      </div>
    </div>
  )
}

Page.getInitialProps = async () => {
  const client = new TravelCloudClient(config.tcUser)
  const pageBanners = (await client.documents({ code: 'page-banners' })).result[0]
  return { pageBanners }
}

export default Page