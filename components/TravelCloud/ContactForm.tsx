import React, { Fragment } from "react";
import { Form, Input, Row, Col, Button } from "antd";
import { WrappedFormUtils } from "antd/lib/form/Form";
import FloatLabel from "../Utilities/FloatLabel";
import { TravelCloudClient } from "travelcloud-antd";
import config from "../../customize/config";

export const ContactForm = Form.create()(
  class extends React.Component<{ form: WrappedFormUtils; customer?}> {
    state = {
      emailSubject: "" as string
    };

    private client = new TravelCloudClient(config.tcUser);

    getParameterByName(name, url) {
      if (!url) url = window.location.pathname;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    componentDidMount() {
      const url = window.location.href;
      const sub = this.getParameterByName("sub", url);
      this.setState({
        emailSubject: sub
      });
    }

    onSubmit = () => {
      this.props.form.validateFieldsAndScroll(async (error, values) => {
        if (!error) {
          this.setState({
            formState: 'submitting'
          })

          const result = await this.client.submitContactForm({
            referral_site: `${config.domain}`,
            subject: 'Contact form',
            customer_name: values.name,
            customer_email: values.email
          }, values)

          if (result.result == null) {
            this.setState({
              formState: 'error'
            })
          } else {
            this.setState({
              formState: 'submitted',
              showForm: false
            })
          }
        } else {
          //console.log('error', error, values);
        }
      })
    }


    render() {
      const { form } = this.props;
      const { getFieldDecorator } = form;
      const name = form.getFieldValue("name");
      const email = form.getFieldValue("email");
      const phone = form.getFieldValue("phone");
      const message = form.getFieldValue("message");
      const subject = form.getFieldValue("subject");
      return (
        <Fragment>
          <Row
            className="text-left"
            gutter={20}
            type="flex"
            justify="space-between"
          >
            <Col md={12} sm={24} xs={24}>
              <Form.Item>
                <FloatLabel label="First Name" name="name" value={name}>
                  {getFieldDecorator("name", {
                    initialValue:
                      this.props.customer != null
                        ? this.props.customer.name
                        : "",
                    rules: [
                      {
                        required: true,
                        message: "Please enter your name",
                        whitespace: true
                      }
                    ]
                  })(<Input autoComplete="off" />)}
                </FloatLabel>
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item>
                <FloatLabel label="Email" name="email" value={email}>
                  {getFieldDecorator("email", {
                    initialValue:
                      this.props.customer != null
                        ? this.props.customer.email
                        : "",
                    rules: [
                      {
                        type: "email",
                        message: "E-mail is not valid"
                      },
                      {
                        required: true,
                        message: "Please enter your E-mail"
                      }
                    ]
                  })(<Input autoComplete="off" />)}
                </FloatLabel>
              </Form.Item>
            </Col>

            <Col md={12} sm={24} xs={24}>
              <Form.Item>
                <FloatLabel label="Phone" name="phone" value={phone}>
                  {getFieldDecorator('phone', {
                    initialValue: this.props.customer != null ? this.props.customer.phone : "",
                    rules: [{ required: true, pattern: new RegExp('^[0-9 ]*$'), message: 'Please enter only numbers' }],
                  })(
                    <Input autoComplete="off" />
                  )}
                </FloatLabel>
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item>
                <FloatLabel label="Subject" name="subject" value={subject}>
                  {getFieldDecorator('subject', {
                    rules: [{ required: true, message: 'Please enter a subject', whitespace: true }],
                    initialValue: !!this.state.emailSubject ? this.state.emailSubject : ""
                  })(
                    <Input autoComplete="off" />
                  )}
                </FloatLabel>
              </Form.Item>
            </Col>
          </Row>
          <Row className="text-left">
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item>
                <FloatLabel label="Message" name="message" value={message}>
                  {getFieldDecorator("message", {
                    rules: [
                      {
                        required: true,
                        message: "Please enter your message",
                        whitespace: true
                      }
                    ]
                  })(
                    <Input.TextArea
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      autoComplete="off"
                    />
                  )}
                </FloatLabel>
              </Form.Item>
            </Col>
            <Button className="m-t-40 silk-primary-btn" onClick={this.onSubmit}>Send an enquiry</Button>
          </Row>
        </Fragment>
      );
    }
  }
);
