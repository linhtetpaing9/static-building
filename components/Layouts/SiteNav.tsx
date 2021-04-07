import React, { useState } from "react"
import Link from "next/link"
import { Button, Menu, Drawer, Row, Col } from "antd"
import { extractSquareBracket, includeHttps, splitContent } from "../Utilities/CommonFunction";

const { SubMenu } = Menu;

export function SiteNav({
  windowSize = "",
  // openCart,
  navigationContent = {}
}: {
  windowSize: any,
  customer?: any,
  cart?: any
  openCart?: any,
  navigationContent: any
}) {
  const [drawer, setDrawer] = useState(false);

  const menu = splitContent(navigationContent)


  return (
    <section id="main-header">
      <section id="bottom-header">
        <div className="wrap p-x-10 p-t-15">
          <Row type="flex" justify="center">
            <Col>
              {
                windowSize.width < 768 ?
                  <div className="pad-t-30 pad-r-30">
                    <Button
                      className="color-primary m-t-5"
                      shape="circle"
                      icon="menu"
                      size="large"
                      onClick={() => setDrawer(true)}
                    />
                    <div>
                      <Drawer
                        placement="left"
                        closable={true}
                        width={'100%'}
                        onClose={() => setDrawer(false)}
                        visible={drawer}
                      >
                        <Menu onClick={() => setDrawer(false)} selectedKeys={['Home']} mode="inline">
                          {menu.map((item, index) =>
                            item.children
                              ? <SubMenu
                                key={`menu-${index}`}
                                className="p-x-0"
                                title={
                                  <div className={`fs-15 font-primary p-x-0`}>
                                    <a className="text-black">{item.title}
                                    </a>
                                  </div>
                                }
                              >
                                {item.children.map(child =>
                                  <Menu.Item key={child.title}>
                                    <Link href={child.url || '#'}>
                                      <div className="fs-15 font-primary">
                                        <a className="text-black">{child.title}</a>
                                      </div>
                                    </Link>
                                  </Menu.Item>
                                )}
                              </SubMenu>
                              :
                              <Menu.Item key={item.title} className="p-x-0">
                                <div>
                                  <Link href={item.url || '#'}>
                                    <div className={`fs-15 font-primary`}>
                                      <a className={`text-black p-x-40 p-y-8 ${!index ? "br-l-0" : ""} ${index == menu.length - 1 ? "br-r-0" : ""}`}>{item.title}</a>
                                    </div>
                                  </Link>
                                </div>
                              </Menu.Item>
                          )}
                        </Menu>

                      </Drawer>
                    </div>
                  </div>
                  :
                  <Menu onClick={() => { }} selectedKeys={['Home']} mode="horizontal" className="min-height-82">
                    {menu.map((item, index) =>
                      item.children
                        ? <SubMenu
                          key={`menu-${index}`}
                          className="p-x-0"
                          title={
                            <div className={`fs-15 font-primary p-x-0`}>
                              <a className="text-black">{item.title}
                              </a>
                            </div>
                          }
                        >
                          {item.children.map(child =>
                            <Menu.Item key={child.title}>
                              <Link href={child.url || '#'}>
                                <div className="fs-15 font-primary">
                                  <a className="text-black">{child.title}</a>
                                </div>
                              </Link>
                            </Menu.Item>
                          )}
                        </SubMenu>
                        :
                        <Menu.Item key={item.title} className="p-x-0">
                          <div>
                            <Link href={item.url || '#'}>
                              <div className={`fs-15 font-primary`}>
                                <a className={`text-black p-x-40 p-y-8 br-r-primary ${!index ? "br-l-0" : ""} ${index == menu.length - 1 ? "br-r-0" : ""}`}>{item.title}</a>
                              </div>
                            </Link>
                          </div>
                        </Menu.Item>
                    )}
                  </Menu>
              }
            </Col>
          </Row>
        </div>
      </section>


    </section>
  )
}