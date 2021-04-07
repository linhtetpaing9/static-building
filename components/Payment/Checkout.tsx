import React from 'react'
import { Form, Select, Input, Radio } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { CountryDropdown } from 'travelcloud-antd/components/country-dropdown'
import { dateToIsoDate } from 'travelcloud-antd/travelcloud'

function vw(value) {
  return { value }
}

export const initialCheckoutForm = (order, demo = false) => {
  if (order == null || order.products == null) return null
  const maxAdult = order.products.reduce((acc, product) => product.adult != null ? Math.max(parseInt(product.adult), acc) : acc, 0)
  const maxChild = order.products.reduce((acc, product) => product.child != null ? Math.max(parseInt(product.child), acc) : acc, 0)
  const maxInfant = order.products.reduce((acc, product) => product.infant != null ? Math.max(parseInt(product.infant), acc) : acc, 0)
  const types = Array(maxAdult).fill('adult').concat(Array(maxChild).fill('child')).concat(Array(maxInfant).fill('infant'))

  if (demo === false) {
    const travelers = types.map(type => ({ type: vw(type) }))
    return { travelers: travelers }
  }

  const travelers = types.map((type, index) => {

    const now = new Date()
    var birth_date = '1990-12-25'
    if (type === 'adult') {
      now.setFullYear(now.getFullYear() - 30)
      birth_date = dateToIsoDate(now)
    }

    else if (type === 'child') {
      now.setFullYear(now.getFullYear() - 6)
      birth_date = dateToIsoDate(now)
    }

    else if (type === 'infant') {
      now.setFullYear(now.getFullYear() - 1)
      birth_date = dateToIsoDate(now)
    }

    return {
      type: vw(type),
      first_name: vw("John" + String.fromCharCode('A'.charCodeAt(0) + index)),
      last_name: vw("Doe"),
      title: vw("Mr"),
      country: vw("SG"),
      passport: vw("S1234567A"),
      birth_date: vw(birth_date),
      expiry: vw("2025-12-25"),
    }
  })

  return {
    email: vw("demo@pytheas.travel"),
    phone: vw("12345678"),
    first_name: vw("John"),
    last_name: vw("Doe"),
    travelers
  }
}

export const createCheckoutForm = Form.create<{ onChange?, formState: any, form: any, [key: string]: any }>({
  onFieldsChange(props, changedFields) {
    if (props.onChange != null) props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    const { formState } = props
    if (formState == null) return {}

    const fields = {
      email: Form.createFormField(
        formState.email || { value: '' }
      ),
      phone: Form.createFormField(
        formState.phone || { value: '' }
      ),
      first_name: Form.createFormField(
        formState.first_name || { value: '' }
      ),
      last_name: Form.createFormField(
        formState.last_name || { value: '' }
      ),
    };

    if (Array.isArray(formState.travelers)) {
      for (let k in formState.travelers) {
        fields[`travelers[${k}].type`] = Form.createFormField(
          formState.travelers[k].type || { value: '' }
        )
        fields[`travelers[${k}].first_name`] = Form.createFormField(
          formState.travelers[k].first_name || { value: '' }
        )
        fields[`travelers[${k}].last_name`] = Form.createFormField(
          formState.travelers[k].last_name || { value: '' }
        )
        fields[`travelers[${k}].title`] = Form.createFormField(
          formState.travelers[k].title || { value: '' }
        )
        fields[`travelers[${k}].country`] = Form.createFormField(
          formState.travelers[k].country || { value: '' }
        )
        fields[`travelers[${k}].passport`] = Form.createFormField(
          formState.travelers[k].passport || { value: '' }
        )
        fields[`travelers[${k}].birth_date`] = Form.createFormField(
          formState.travelers[k].birth_date || { value: '' }
        )
        fields[`travelers[${k}].expiry`] = Form.createFormField(
          formState.travelers[k].expiry || { value: '' }
        )
      }
    }

    return fields;
  }
})

class CheckoutFormComponent extends React.Component<{ form: WrappedFormUtils, formState: any, onChange?}> {
  render() {
    const { form, formState } = this.props
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
    };

    if (formState == null) return null;

    return (
      <Form layout="horizontal">
        <Form.Item
          {...formItemLayout}
          label="Email">
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: 'E-mail is not valid',
            }, {
              required: true, message: 'Please input your E-mail!',
            }],
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Phone Number">
          {getFieldDecorator('phone', {
            rules: [{ required: true, pattern: new RegExp('^[0-9 ]*$'), message: 'Please input numbers!' }],
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="First name">
          {getFieldDecorator('first_name', {
            rules: [{ required: true, message: 'Please input your first name!', whitespace: true }],
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Last name">
          {getFieldDecorator('last_name', {
            rules: [{ required: true, message: 'Please input your last name!', whitespace: true }],
          })(
            <Input />
          )}
        </Form.Item>
        {formState.travelers.map((_value, index) =>
          <TravelerFormComponent key={index} form={this.props.form} index={index} />
        )}
      </Form>
    )
  }
}

export const CheckoutForm = createCheckoutForm(CheckoutFormComponent)

class TravelerFormComponent extends React.Component<{ form: WrappedFormUtils, index: number }> {
  render() {
    const { getFieldDecorator } = this.props.form as WrappedFormUtils;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
    }

    const type = this.props.form.getFieldValue(`travelers[${this.props.index}].type`)

    var minBirthDate = '1901-01-01'

    if (type === 'child') {
      const tmpDate = new Date()
      tmpDate.setFullYear(tmpDate.getFullYear() - 12)
      minBirthDate = dateToIsoDate(tmpDate)
    }
    else if (type === 'infant') {
      const tmpDate = new Date()
      tmpDate.setFullYear(tmpDate.getFullYear() - 2)
      minBirthDate = dateToIsoDate(tmpDate)
    }

    const tmpDate2 = new Date()
    tmpDate2.setMonth(tmpDate2.getMonth() + 6)
    const minPassportExpiry = dateToIsoDate(tmpDate2)
    tmpDate2.setFullYear(tmpDate2.getFullYear() + 20)
    const maxPassportExpiry = dateToIsoDate(tmpDate2)

    return <div>
      <h1>Traveler {this.props.index + 1} {type !== 'adult' && ("(" + type + ")")}</h1>
      <Form.Item
        {...formItemLayout}
        label="First name">
        {getFieldDecorator(`travelers[${this.props.index}].first_name`, {
          rules: [{ required: true, message: 'Please input your first name!', whitespace: true }],
        })(
          <Input />)}
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="Last name">
        {getFieldDecorator(`travelers[${this.props.index}].last_name`, {
          rules: [{ required: true, message: 'Please input your last name!', whitespace: true }],
        })(
          <Input />)}
      </Form.Item>
      <Form.Item
        label="Gender"
        {...formItemLayout}>
        {getFieldDecorator(`travelers[${this.props.index}].title`)(
          <Radio.Group>
            <Radio.Button value="Mr">Male</Radio.Button>
            <Radio.Button value="Ms">Female</Radio.Button>
          </Radio.Group>)}
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="Date of birth">
        {getFieldDecorator(`travelers[${this.props.index}].birth_date`, {
          rules: [{ required: true, message: 'Please select!' }],
        })(
          <DropdownDatePickerInputWrapper min={minBirthDate} form={this.props.form} name={`travelers[${this.props.index}].birth_date`} />
        )}

      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="Nationality">
        <CountryDropdown form={this.props.form} name={`travelers[${this.props.index}].country`} />
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="Passport number">
        {getFieldDecorator(`travelers[${this.props.index}].passport`, {
          rules: [{ required: true, message: 'Please input your passport number!', whitespace: true }],
        })(
          <Input />)}
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label="Passport expiry">
        {getFieldDecorator(`travelers[${this.props.index}].passport`, {
          rules: [{ required: true, message: 'Please select!', whitespace: true }],
        })(
          <DropdownDatePickerInputWrapper min={minPassportExpiry} max={maxPassportExpiry} form={this.props.form} name={`travelers[${this.props.index}].expiry`} />
        )}
      </Form.Item>
    </div>
  }
}

export interface DropdownDatePicker {
  min?: string;
  max?: string;
  value?: number;
  onChange?: (value: number | string | undefined) => void;
  disabled?: boolean;
  size?: 'large' | 'small' | 'default';
  style?: React.CSSProperties;
  className?: string;
  name?: string;
}

// only for parsing iso format string
function parseDateString(str: string) {
  var result = new Date(str)
  if (isNaN(result.getTime()) == false) return result
  return new Date()
}

function getLastDayOfMonth(valDate: Date) {
  const valDateClone = new Date(valDate.getTime())
  valDateClone.setMonth(valDateClone.getMonth() + 1)
  valDateClone.setDate(0)
  return valDateClone.getDate()
}

const DropdownDatePickerInputWrapper = (props: DropdownDatePicker & { form: WrappedFormUtils }) => {
  const { getFieldDecorator } = props.form as WrappedFormUtils;

  const val = props.form.getFieldValue(props.name)

  var valDate = parseDateString(val)
  const minDate = parseDateString(props.min)
  const maxDate = parseDateString(props.max)

  // we only clip the year input
  // actual min/max should be validated elsewher
  // this is to avoid changing the user's input as he is entering
  if (valDate.getFullYear() < minDate.getFullYear()) valDate.setFullYear(minDate.getFullYear())
  if (valDate.getFullYear() > maxDate.getFullYear()) valDate.setFullYear(maxDate.getFullYear())

  const validYears = Array(maxDate.getFullYear() - minDate.getFullYear() + 1).fill(null).map((_, index) => minDate.getFullYear() + index)
  const maxValidDate = getLastDayOfMonth(valDate)
  const validDays = Array(maxValidDate).fill(null).map((_, index) => index + 1)

  const year = valDate.getFullYear()
  const month = valDate.getMonth()
  const day = valDate.getDate()

  const yearChanged = (updated) => {
    valDate.setFullYear(updated)
    if (valDate.getDate() != day) {
      valDate.setMonth(month)
      valDate.setDate(getLastDayOfMonth(valDate))
    }
    props.form.setFieldsValue({
      [props.name]: dateToIsoDate(valDate)
    })
  }

  const monthChanged = (updated) => {
    valDate.setMonth(updated)
    if (valDate.getDate() != day) {
      valDate.setMonth(updated)
      valDate.setDate(getLastDayOfMonth(valDate))
    }
    props.form.setFieldsValue({
      [props.name]: dateToIsoDate(valDate)
    })
  }

  // assume user fill year -> month -> day
  // we don't try to clip invalid day, just overflow
  // also, invalid days shouldn't show in dropdown
  const dayChanged = (updated) => {
    valDate.setDate(updated)
    props.form.setFieldsValue({
      [props.name]: dateToIsoDate(valDate)
    })
  }

  getFieldDecorator(props.name)

  return <div>
    <Select showSearch value={day} onChange={dayChanged} style={{ marginRight: '2%', width: '20%' }}>
      {validDays.map(validDay => <Select.Option key={String(validDay)} value={validDay}>{validDay}</Select.Option>)}
    </Select>
    <Select showSearch value={month} onChange={monthChanged} style={{ marginRight: '2%', width: '50%' }}
      filterOption={(input, option) => (option.props.children as any).toLowerCase().indexOf(input.toLowerCase()) >= 0
        || (option.props.value as any) + 1 == parseInt(input)}>
      <Select.Option key={String(0)} value={0}>January</Select.Option>
      <Select.Option key={String(1)} value={1}>February</Select.Option>
      <Select.Option key={String(2)} value={2}>March</Select.Option>
      <Select.Option key={String(3)} value={3}>April</Select.Option>
      <Select.Option key={String(4)} value={4}>May</Select.Option>
      <Select.Option key={String(5)} value={5}>June</Select.Option>
      <Select.Option key={String(6)} value={6}>July</Select.Option>
      <Select.Option key={String(7)} value={7}>August</Select.Option>
      <Select.Option key={String(8)} value={8}>September</Select.Option>
      <Select.Option key={String(9)} value={9}>October</Select.Option>
      <Select.Option key={String(10)} value={10}>November</Select.Option>
      <Select.Option key={String(11)} value={11}>December</Select.Option>
    </Select>

    <Select showSearch value={year} onChange={yearChanged} style={{ width: '25%' }}>
      {validYears.map(validYear => <Select.Option key={String(validYear)} value={validYear}>{validYear}</Select.Option>)}
    </Select>
  </div> as any
}
