import React from 'react'
import { Spin } from 'antd'

export const NoResult: React.StatelessComponent<{ children?: any, type: any, className?: string, response: any, loading?: boolean, style?: React.CSSProperties, loadingMessage?: string }> = ({ response, style, className, loading, type, children, loadingMessage }) => {
  if (loading === false && response.error != null) {
    return <div style={{ textAlign: 'center' }} className={className}>
      <p>No result to show. Please change your dates and search again.</p>
    </div>
  }

  else if (response.loading === true || loading === true) {
    loadingMessage = 'Searching...'

    return <div style={{ textAlign: 'center' }} className={className}>
      <Spin size="large" style={{ margin: '20px auto 0' }} />
      <h1 style={{ width: '100%', marginTop: '0' }}>{loadingMessage}</h1>
    </div>
  }

  if (response.result == null) {
    return <div style={{ textAlign: 'center', ...style }} className={className}>{children}</div>
  }

  if (response.result.length === 0) {
    return <div style={{ textAlign: 'center', ...style }} className={className}>
      No {type} matching your search criteria was found.
  </div>
  }

  return null
}
