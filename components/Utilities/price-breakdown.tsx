import React from "react"
import { Icon, Table } from "antd"
import { priceDisplay } from "./CommonFunction"

export const PriceBreakdown = ({
  invoiceEntries = [] as any,
  cartProducts = null as any
}) => {

  const renderContent = (value, row) => {
    const obj:any = {
      children: value,
      props: {}
    }
    if (!row.quantity) {
      obj.props.colSpan = 2
    }
    if (value === undefined) {
      obj.props.colSpan = 0
    }
    return obj
  }
  
  const columns:any = [
    {
      title: 'Items',
      dataIndex: 'items',
      render: renderContent
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      className: 'column-right',
      render: renderContent
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      className: 'column-right',
      render: renderContent,
      fixed: 'right'
    }
  ]

  let data
  
  if (invoiceEntries) {
    data = invoiceEntries
      // only get items with quantity > 0
      .filter(entry => 
        entry[1].reduce((acc, cur) => {
          acc += cur.quantity
          return acc
        }, 0) > 0
      )
      .reduce((accEntry, curEntry) => {
        const titleRow = {
          items: <strong>{curEntry[0]}</strong>,
          subtotal: <Icon type="down" />
        }
        accEntry = accEntry.concat(titleRow)
        const childrenRows = curEntry[1].map(item => {
          return {
            items: item.name,
            quantity: item.quantity,
            subtotal: priceDisplay({
              value: (parseFloat(item.price) * item.quantity),
              showZeroCents: true
            })
          }
        })
        accEntry = accEntry.concat(childrenRows)
        return accEntry
      }, [])
  }

  if (cartProducts) {
    data = cartProducts.reduce((prdAcc, prdCur) => {
      const cur = prdCur.items.map(item => {
        return {
          items: item.name,
          quantity: item.quantity,
          subtotal: priceDisplay({
            value: (parseFloat(item.price) * item.quantity),
            showZeroCents: true
          })
        }
      })
      prdAcc = prdAcc.concat(cur)
      return prdAcc
    }, [])
  }
  
  return (
    <div className="table-container">
      <Table
        className="price-breakdown-table"
        
        pagination={false}
        columns={columns}
        dataSource={data}
        bordered={false}
      />
    </div>
  )
}