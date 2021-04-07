
import React, { Fragment } from 'react'
import { Form, Input, Row, Col } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Element, Events, scroller } from 'react-scroll'

export const ContactForm = Form.create<{ form: WrappedFormUtils, title: any, customer?: any, wrappedComponentRef }>()(
  class extends React.Component<{ form: WrappedFormUtils, title: any, customer?: any }> {
    state = {
      emailSubject: '' as string
    };
    getParameterByName(name, url) {
      if (!url) url = window.location.pathname;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    componentDidMount() {
      const url = window.location.href;
      const sub = this.getParameterByName('sub', url);
      this.setState({
        emailSubject: sub
      }

      )

      Events.scrollEvent.register('begin', function () {
        console.log("begin", arguments);
      });

      Events.scrollEvent.register('end', function () {
        console.log("end", arguments);
      });
    }

    scrollToForm() {
      scroller.scrollTo('contact-form', {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
        offset: -10
      })
    }
    render() {
      const { form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Fragment>
          {!!(this.state.emailSubject) ? this.scrollToForm() : ""}
          <Element name="contact-form">
            <Row gutter={24} type="flex" justify="space-between">
              <Col xs={24} sm={12} lg={12}>
                <Form.Item>
                  {getFieldDecorator('name', {
                    initialValue: this.props.customer != null ? this.props.customer.name : "",
                    rules: [{ required: true, message: 'Please enter your name', whitespace: true }],
                  })(
                    <Input placeholder="Name*" />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={12}>
                <Form.Item>
                  {getFieldDecorator('email', {
                    initialValue: this.props.customer != null ? this.props.customer.email : "",
                    rules: [{
                      type: 'email', message: 'E-mail is not valid',
                    }, {
                      required: true, message: 'Please enter your E-mail',
                    }],
                  })(
                    <Input placeholder="Email*" />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row type="flex" justify="space-between">
              <Col xs={24} sm={24} md={24} lg={24}>
                <Form.Item>
                  {getFieldDecorator('phone', {
                    rules: [{ required: true, pattern: new RegExp('^[0-9 ]*$'), message: 'Please enter only numbers' }],
                  })(
                    <Input placeholder="Contact Number*" />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} hidden>
                <Form.Item>
                  {getFieldDecorator('tour', {
                    rules: [{ required: true, message: 'Please enter tour', whitespace: true }],
                    initialValue: this.props.title
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row type="flex" justify="space-between">
              <Col xs={24} sm={24} md={24} lg={24}>
                <Form.Item>
                  {getFieldDecorator('message', {
                    rules: [{ required: true, message: 'Please enter your message', whitespace: true }],
                  })(
                    <Input.TextArea autosize={{ minRows: 6, maxRows: 8 }} placeholder="Your Message" />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Element>
        </Fragment>
      );
    }
  }
)
