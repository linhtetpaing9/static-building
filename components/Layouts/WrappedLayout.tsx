import React, { useEffect, useState } from 'react'
import { SiteNav } from './SiteNav'
import Router from "next/router"
import { Button, Drawer, Icon, Layout, notification, Result } from 'antd';
import config from '../../customize/config';
import { Cart, setupGtag, TravelCloudClient } from 'travelcloud-antd';
import { Order } from "travelcloud-antd/components/order"
import Link from 'next/link';
import { WhatsAppIcon } from '../Utilities/Svg';
import { Account } from "travelcloud-antd/components/account"
import { SiteFooter } from './SiteFooter';
import Head from 'next/head';

const { Header, Content } = Layout;

const WrappedLayout = ({ children, content, hasError, pageProps }) => {
  const [windowSize, setWindowSize] = useState<any>({})
  const [adminMode, setAdminMode] = useState<boolean>(false)
  const [sider, setSider] = useState<string>("")
  const [order, setOrder] = useState<any>({ loading: true })
  const [customer, setCustomer] = useState<any>({ loading: true })
  const [, setPriceRules] = useState<any>({ loading: true })
  const [cart, setCart] = useState<any>(null)

  const client: TravelCloudClient = new TravelCloudClient(config.tcUser)

  useEffect(() => {
    if (window.location.pathname === "/admin") {
      window.location.href = `https://${config.tcUser}.travelcloud.app/admin/en`
    }

    setupGtag(Router, config)

    // cookies notification
    if (localStorage.getItem("setted") !== "1") {
      openNotification()
    }

    setCart(new Cart({
      client,
      priceRules: content.priceRules,
      onOrderChange: (order) => setOrder(order),
      onCustomerChange: (customer) => setCustomer(customer),
      onPriceRulesChange: (priceRules) => setPriceRules(priceRules)
    }))

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.code === "Backquote") {
        setAdminMode(!adminMode)
      }
    })

    checkWindowSize();
    window.addEventListener("resize", checkWindowSize)
  }, [])

  const openNotification = () => {
    notification.open({
      duration: 4.5,
      btn: null,
      placement: "bottomLeft",
      message:
        <small>
          We use cookies to improve our website information and services. By using our site, you consent to cookies as outlined in our <Link href="/document/privacy-policy#cookies"><a>Privacy Policy</a></Link>.
        </small>
    })
    localStorage.setItem("setted", "1")
  }

  const checkWindowSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  const openCart = async () => {
    setSider("cart")
  }

  // const openAccount = async () => {
  //   setSider("account")
  //   await cart.refreshCustomer()
  // }

  const closeCart = () => {
    setSider("")
  }

  const backToHome =
    <Link href="/">
      <div className="flex-button">
        <Button type="primary" size="large">
          Back Home
          </Button>
      </div>
    </Link>

  const header = content.find(c => c.code == "Header");
  console.log({header})

  const Component = children;

  const cartIsEmpty =
    order.result == null ||
    order.result.products == null ||
    order.result.products.length === 0

  return (
    <div className="fluid-background">
      <Layout className="layout wrap-fluid">
        <Header>
          <Head>
            <title>{config.defaultTitle}</title>
            {/* https://favicon.io/ */}
            <link rel="apple-touch-icon" sizes="180x180" href={`${config.domain}/img/favicon_io/apple-touch-icon.png`} />
            <link rel="icon" type="image/png" sizes="32x32" href={`${config.domain}/img/favicon_io/favicon-32x32.png`} />
            <link rel="icon" type="image/png" sizes="16x16" href={`${config.domain}/img/favicon_io/favicon-16x16.png`} />
            {/* <link rel="manifest" href={`${config.domain}/img/favicon_io/site.webmanifest`} /> */}
            {/* https://megatags.co/ */}
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="utf-8" />
            {/* Search Engine */}
            <meta name="description" content={config.description} />
            <meta name="image" content={`${config.domain}/img/og/1200x630.jpg`} />
            {/* Schema.org for Google */}
            <meta itemProp="name" content={config.defaultTitle} />
            <meta itemProp="description" content={config.description} />
            <meta itemProp="image" content={`${config.domain}/img/og/1200x630.jpg`} />
            {/* Twitter */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={config.defaultTitle} />
            <meta name="twitter:description" content={config.description} />
            <meta name="twitter:image:src" content={`${config.domain}/img/og/1024x512.jpg`} />
            {/* Open Graph general (Facebook, Pinterest & Google+) */}
            <meta name="og:title" content={config.defaultTitle} />
            <meta name="og:description" content={config.description} />
            <meta name="og:image" content={`${config.domain}/img/og/1200x630.jpg`} />
            <meta name="og:url" content={`http://${config.domain}`} />
            <meta name="og:site_name" content={config.defaultTitle} />
            <meta name="og:locale" content="en_US" />
            <meta name="og:type" content="website" />
            {/* facebook pixel code */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            {/* custom font */}
            <link rel="stylesheet" type="text/css" href="/fonts/style.css" />
          </Head>
          <SiteNav
            navigationContent={header}
            customer={customer || undefined}
            windowSize={windowSize}
            openCart={openCart}
          />
        </Header>
        <Content >
          {hasError
            ? <Result
              status={500}
              title="Error"
              subTitle="Sorry, something went wrong."
              extra={backToHome}
            />
            : pageProps["statusCode"]
              ? <Result
                status={pageProps["statusCode"]}
                title={`Error: ${pageProps["statusCode"]}`}
                subTitle="Sorry, something went wrong."
                extra={backToHome}
              />
              : <Component
                Component
                windowSize={windowSize}
                client={client}
                customer={customer}
                order={order}
                cart={cart}
                openCart={() => openCart()}
                adminMode={adminMode}
                {...pageProps}
              />
          }

          <Drawer
            className="cart-drawer"
            visible={!!sider}
            closable={false}
            onClose={closeCart}
            width={windowSize.width < 992 ? "100%" : "50%"}
          >
            <div style={{ textAlign: "right" }}>
              <Icon type="close" onClick={closeCart} style={{ cursor: "pointer" }} />
            </div>

            {sider === "cart" &&
              <>
                <h3 className="color-primary"><strong>Shopping Cart</strong></h3>

                {cartIsEmpty
                  ? <div>Your cart is empty</div>
                  : <>
                    <Order
                      order={order.result}
                      showSection={{ products: true, remove: true }}
                      cart={cart}
                    />
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => {
                        setSider("");
                        Router.push("/checkout")
                      }}
                    >
                      Proceed to checkout
                      </Button>
                  </>
                }
              </>
            }

            {sider === "account" &&
              <Account customer={customer} cart={cart} />
            }
          </Drawer>

          <a
            className="whatsapp"
            href={`https://wa.me/${config.phone.replace(/\+/g, '').replace(/ /g, '')}`}
            target="_blank">
            <WhatsAppIcon width={46} height={46} />
          </a>
        </Content>
        {/* <SiteFooter
          windowSize={windowSize}
          footerContent={footer}
        /> */}
      </Layout>
    </div>
  );
}
export default WrappedLayout;