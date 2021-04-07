import React from "react"
import moment from "moment"
import config from "../../customize/config"
import { Form, Input, Row, Col, Button, Modal } from "antd"
import { WrappedFormUtils } from "antd/lib/form/Form"
import { TravelCloudClient } from "travelcloud-antd"

export function disabledDate(current) {
  // Can not select days before today and today
  return current && current < moment().endOf("day")
}

export const GeneralForm = Form.create<{ form: WrappedFormUtils, wrappedComponentRef }>()(
  class extends React.Component<{ form: WrappedFormUtils }> {
    state = {
      phone_code: 65,
      phone_number: null
    }

    onChange = (e,field) => {
      const { value } = e.target
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/
      if ((!isNaN(value) && reg.test(value)) || value === "" || value === "-") {
        if (field == "phone_code") {
          this.props.form.setFieldsValue({ phone: `+${value} ${this.state.phone_number}` })
          this.setState({ phone_code: value })
        } else if (field == "phone_number") {
          this.props.form.setFieldsValue({ phone: `+${this.state.phone_code} ${value}` })
          this.setState({ phone_number: value })
        }
      }
    }

    render() {
      const { form } = this.props
      const { getFieldDecorator } = form
      return (
        <Form>
          <Row type="flex">
            <Col xs={24} md={12}>
              <label>First Name *</label>
              <Form.Item className="border-right-adjustment">
                {getFieldDecorator("first_name", {
                  rules: [{ required: true, message: "Please enter your first name.", whitespace: true }]
                })( <Input placeholder="First name" /> )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <label>Last Name *</label>
              <Form.Item className="border-right-adjustment">
                {getFieldDecorator("last_name", {
                  rules: [{ required: true, message: "Please enter your last name.", whitespace: true }]
                })( <Input placeholder="Last name" /> )}
              </Form.Item>
            </Col>
            {getFieldDecorator("subject", {
              initialValue: "Feedback"
            })( <Input hidden /> )}
          </Row>
          <Row type="flex">
            <Col xs={24} md={12}>
              <label>Email *</label>
              <Form.Item className="border-right-adjustment">
                {getFieldDecorator("email", {
                  rules: [
                    { type: "email", message: "Email is not valid." },
                    { required: true, message: "Please enter your email."} 
                  ]
                })( <Input placeholder="Your email address" /> )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <label>Contact number *</label>
              <Form.Item className="border-right-adjustment">
                {getFieldDecorator("phone", {
                  rules: [{ required: true, message: "Please enter your contact number." }]
                })( 
                  <Input type="hidden" />
                )}
                <Input.Group compact>
                  <Input prefix="+" placeholder="65" onChange={(x) => this.onChange(x,"phone_code")} value={this.state.phone_code} style={{ width: "30%" }} />
                  <Input placeholder="Your contact number" onChange={(x) => this.onChange(x,"phone_number")} value={this.state.phone_number} style={{ width: "70%" }} />
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row type="flex">
            <Col xs={24}>
              <label>Message *</label>
              <Form.Item>
                {getFieldDecorator("message", {
                  rules: [{ required: true, message: "Please enter your message.", whitespace: true }]
                })( <Input.TextArea rows={7} style={{resize:"none"}} placeholder="Type in your message." /> )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    }
  }
)

export class ContactFormComponent extends React.Component<any, any>{
  formRef
  client: TravelCloudClient = new TravelCloudClient(config.tcUser)
  state = {
    agreeTerms: false,
    formState: ""
  }

  agreeTerms = (e) => {
    this.setState({ agreeTerms: e.target.checked })
  }

  onSubmit = () => {
    this.formRef.props.form.validateFieldsAndScroll(async (error, values) => {
      if (!error) {
        /*
        if (values.subscribe){
          // we ignore the return status because we don't want to affect checkout
          await this.client.subscribeEdm({
            'email': values.email,
            'mailchimp_list_id': '77b2133b2a',
            'attributes': {
              // FNAME and LNAME are based on mailchimp default merge_fields
              'FNAME' : values.first_name,
              'LNAME' : values.last_name
            }
          })
        }
        const dataLayer = (window as any).dataLayer
        if (dataLayer != null) dataLayer.push({
          "event": "contact_form",
          "formType": "custom",
          "formPosition": "header"
        })
        */
        this.setState({ formState: "submitting" })
        const result = await this.client.emailAdmins({
          referral_site: config.domain,
          subject: this.props.subject,
          customer_name: values.name,
          customer_email: values.email,
          admin_emails: this.props.emailAdmins || [config.email]
        }, values)
        if (result.result == null) {
          this.setState({ formState: "error" })
        } else {
          this.setState({ formState: "submitted" })
          if (this.props.closeModal) {
            setTimeout(function () {
              this.props.closeModal
            },4000)
          }
        }
      } else {
        //console.log("error", error, values)
      }
    })
  }

  render () {

    let heading:any = this.props.subject || "Contact Form"
    let contactForm = <GeneralForm wrappedComponentRef={(formRef) => { this.formRef = formRef }} />

    let formState:any = {
      heading: heading,
      body: <div>
        {contactForm}
        <Button
          size="large"
          type="primary"
          disabled={this.state.agreeTerms !== true || (this.state.formState !== "" && this.state.formState !== "error")}
          onClick={this.onSubmit}
        >
          SUBMIT
        </Button>
      </div>
    }

    if (this.state.formState === "error") {
      formState = {
        heading: "Error",
        body: <p>There was a problem submitting the form. Please try again later.</p>
      }
    }

    if (this.state.formState === "submitted") {
      formState = {
        heading: "Thank you",
        body: <p>We have received your enquiry. Our travel consultant will get in touch with you (via email or phone) within 3 working days.</p>
      }
    }

    return (
      this.props.useModal
        ? <Modal
            title={formState.heading}
            footer={null}
            visible={this.props.visible} 
            onCancel={this.props.closeModal}
          >
            {formState.body}
          </Modal>
        : <div>
            <h4 className="heading">{formState.heading}</h4>
            {formState.body}
          </div>
    )
  }
}