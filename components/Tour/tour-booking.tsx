import React from "react"
import Calendar from "travelcloud-antd/components/calendar"
import moment from "moment"
import { Form, Button, List, Steps, Radio, Select, Card, Row, Col, Result, Icon, Input, Skeleton, Popover } from "antd"
import { WrappedFormUtils } from "antd/lib/form/Form"
import { InputNumberProps } from "travelcloud-antd/components/inc-dec-input"
import { dateToIsoDate, formatCurrency, extractValueFromFormState, Cart } from "travelcloud-antd/travelcloud"
import { createTourBookingForm, TourBookingFormValue, SelectedOptionDayInfo, Room } from "travelcloud-antd/components/tour-booking"
import { Tour } from "travelcloud-antd/types"
import { ColumnCount } from "antd/lib/list"
import { FixedAspectRatio } from "../Utilities/fixed-aspect-ratio"
import { PriceBreakdown } from "../Utilities/price-breakdown"
import { priceDisplay, useOptimisedImage } from "../Utilities/CommonFunction"

export interface TourBookingContext {
  tour?: Tour
  cart: Cart
  value: TourBookingFormValue
  onChange: (TourBookingFormValue) => void
  onSubmit: (TourBookingFormValue) => void
  //computed values
  tourFormHasAddons: boolean
  allowRooms: boolean
  selectedOption: any
  selectedOptionDateInfoMap: { [key: string]: SelectedOptionDayInfo }
  tourOptionsWithCheapestComputed
  totalPrice
  totalDeposit
  invoiceEntries
  tourAddonsComputed
  grid: ColumnCount
}

export function getAdultLimits(name) {
  let minAdults = 1, maxAdults = 10
  const hasPaxInName = name.toLowerCase().indexOf('pax') > -1 || false
  if (hasPaxInName) {
    const paxInfo = name.toLowerCase().match(/\((.*?)\)/g).find(str => str.indexOf('pax') > -1) || ""
    if (paxInfo.indexOf('min') > -1) minAdults = Number(paxInfo.replace(/[^0-9]/g, ''))
    else if (paxInfo.indexOf('max') > -1) maxAdults = Number(paxInfo.replace(/[^0-9]/g, ''))
    else if (paxInfo.indexOf('to') > -1) {
      const [min, max] = paxInfo.split('to')
      minAdults = Number(min.replace(/[^0-9]/g, ''))
      maxAdults = Number(max.replace(/[^0-9]/g, ''))
    }
    else {
      minAdults = Number(paxInfo.replace(/[^0-9]/g, ''))
      maxAdults = minAdults
    }
  }
  return {
    min: minAdults,
    max: maxAdults
  }
}

export const TourBookingForm = createTourBookingForm(
  class extends React.Component<TourBookingContext> {
    state = {
      visible: false,
      currentStep: 0,
      initLoading: true
    }

    componentDidMount() {
      const options = this.props.tourOptionsWithCheapestComputed || this.props.tour.options
      const adultLimits = getAdultLimits(options[0].name)
      this.props.value.rooms[0].adult = adultLimits.min
      this.props.onChange({ ...this.props.value, option_id: options[0].id })
      this.setState({ initLoading: false })
    }

    next() {
      this.setState({ currentStep: this.state.currentStep + 1 })
    }

    prev() {
      this.setState({ currentStep: this.state.currentStep - 1 })
    }

    render() {
      const {
        tour,
        value,
        onChange,
        selectedOptionDateInfoMap,
        allowRooms,
        selectedOption,
        totalPrice,
        // totalDeposit,
        invoiceEntries,
        tourOptionsWithCheapestComputed,
        tourFormHasAddons,
        tourAddonsComputed
      } = this.props

      if (tour == null || tour.options.length === 0) {
        return (
          <Result
            icon={<Icon type="smile" theme="twoTone" />}
            title="Departure details coming soon."
            extra={"Please check back later."}
            style={{ backgroundColor: "#f0f0f0" }}
          />
        )
      }

      // not sure why but the grid={gutter: 16} doesn"t work on List
      // we pad List.Item manually here
      var roomList = []
      const optionSelected = tour.options.find(option => option.id === value.option_id)
      // const adultLimits = getAdultLimits(optionSelected?.name || tour.options[0].name)
      const departureSelected = optionSelected == null
        ? null
        : optionSelected.departures.find(departure => departure.date === value.departure_date)
      const availableSlots = departureSelected == null
        ? null
        : parseInt(departureSelected.slots_total) - parseInt(departureSelected.slots_taken)
      const currentTotal = value.rooms.reduce((acc, room) => {
        if (room.adult != null) acc += parseInt("" + room.adult)
        if (room.child_with_bed != null) acc += parseInt("" + room.child_with_bed)
        if (room.child_no_bed != null) acc += parseInt("" + room.child_no_bed)
        return acc
      }, 0)
      const isFull =
        optionSelected != null
        && currentTotal >= availableSlots
        && optionSelected.on_demand_advance_booking === "0"

      if (optionSelected != null) {
        roomList = value.rooms.map((item, index) => (
          <List.Item style={{ padding: 8 }}>
            <RoomForm
              className="room"
              tour={tour}
              value={item}
              index={index}
              isFull={isFull}
              limits={(tour.price_type === 'ALL' || tour.price_type.indexOf('SGL') !== -1)
                ? null
                : getAdultLimits(optionSelected.name)
              }
              numberOfSiblings={value.rooms.length}
              deleteSelf={() => {
                value.rooms.splice(index, 1)
                onChange(Object.assign({}, value))
              }}
              onChange={(formChanges) => {
                const changes = extractValueFromFormState(formChanges)
                value.rooms[index] = Object.assign({}, value.rooms[index], changes)
                onChange(Object.assign({}, value))
              }}
            />
          </List.Item>
        ))
      }

      // there"s no way to align height using List, so we generate a dummy RoomForm for the "add room" button
      if (value.rooms.length < 4 && allowRooms && !isFull) {
        roomList.push(
          <List.Item style={{ padding: 8 }}>
            <RoomForm
              className="room tc-blur-hide-inputs"
              tour={tour}
              title="New room"
            />
            <Button
              size="large"
              style={{ position: "absolute", top: "50%", left: "15%", marginTop: -20, width: "75%" }}
              onClick={() => {
                value.rooms.push({ adult: 1 })
                onChange(Object.assign({}, value))
              }}
            >
              Add room
            </Button>
          </List.Item>
        )
      }

      const genericAddonsIndexed = tour.generic_addons.reduce((acc, generic_addon) => {
        acc[generic_addon.id] = generic_addon
        return acc
      }, {})

      const options = tourOptionsWithCheapestComputed || tour.options
      const Option = selectedOption ? options.find((opt) => opt.id == selectedOption.id) : null

      const steps = [
        {
          title: "Tour Option",
          description: Option?.name || "",
          content: <>
            <h4 className="color-primary">TOUR OPTIONS</h4>
            <List
              className="tour-options"
              loading={this.state.initLoading}
              dataSource={options}
              renderItem={(option: any, index) => {
                const selected = option.id === value.option_id
                const style = selected ? { color: "#ac9605", fontSize: 16 } : { fontWeight: 400, fontSize: 16, color: '#aeadad' }
                return (
                  <List.Item
                    key={index}
                    style={{ cursor: "pointer" }}
                    onClick={() => { onChange({ ...value, option_id: option.id }) }}
                  >
                    <Skeleton avatar title={false} loading={option.loading} active />
                    <List.Item.Meta
                      avatar={<Icon type="check-circle" style={{ fontSize: 20, opacity: selected ? 1 : 0, color: selected ? "#ac9605" : "#fff" }} />}
                      title={option.name}
                    />
                    <span style={style}>
                      {selected ? "SELECTED" : "SELECT"}
                    </span>
                  </List.Item>
                )
              }}
            />
          </>
        },
        {
          title: 'Departure',
          description: value.departure_date || "",
          content: (
            <div>
              <h4 className="color-primary">DEPARTURES</h4>
              {!Option || Option["_next_departure"] == null
                ? <Result
                  icon={<Icon type="smile" theme="twoTone" />}
                  title="No departures available."
                  extra={"Please check back later."}
                  style={{ backgroundColor: "#f0f0f0" }}
                />
                : <Calendar
                  className="tour-calendar"
                  validRange={[new Date(Option["_next_departure"]), new Date(Option["_last_departure"])]}
                  style={{ marginTop: 20 }}
                  CalendarDayGenerator={(date, isPadding, key) => {
                    const isoDate = dateToIsoDate(date)
                    // if a month does not end on a sat, additional days are drawn to pad out the week
                    // if isPadding, we pretned there"s no dayInfo and don"t display any info
                    const dayInfo = isPadding ? {} : selectedOptionDateInfoMap[isoDate] || ({} as any)
                    const {
                      disabled = true,
                      // afterDiscounts,
                      // noDeparture = true,
                      // slotsRemaining
                    } = dayInfo
                    return (
                      <td
                        role="gridcell"
                        key={key}
                        className={"ant-fullcalendar-cell" + (disabled ? " ant-fullcalendar-disabled-cell" : "") + (moment(value.departure_date).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD') ? " selected" : "")}
                        onClick={() => {
                          if (disabled === false) {
                            onChange(
                              Object.assign({}, value, {
                                departure_date: isoDate
                              })
                            )
                            //this.setState({ currentStep: 2 })
                          }
                        }}
                      >
                        <div className="ant-fullcalendar-date">
                          {date.getDate()}
                        </div>
                      </td>
                    )
                  }}
                />
              }
            </div>
          )
        },
        {
          title: 'Travellers',
          description: value.rooms.reduce((acc, cur) => {
            acc[0] += cur.adult
            acc[1] += cur.child_with_bed + cur.child_no_bed
            acc[2] += cur.infant
            return acc
          }, [0, 0, 0])
            .filter(trv => trv > 0)
            .map((trv, trvIndex) => {
              const trvLabels = [
                { singular: 'Adult', plural: 'Adults' },
                { singular: 'Child', plural: 'Children' },
                { singular: 'Infant', plural: 'Infants' }
              ]
              const txt = trv === 1 ? "singular" : "plural"
              return trv + " " + trvLabels[trvIndex][txt]
            }).join('<br />') || 0,
          content: (
            <div style={{ flex: "1" }}>
              <h4 className="color-primary">NUMBER OF TRAVELLERS</h4>
              <List
                className={allowRooms ? "" : "hide-card-head"}
                grid={{ column: this.props.grid }}
                dataSource={roomList}
                renderItem={(item) => item}
              />
            </div>
          )
        }
      ]

      if (tourFormHasAddons) {
        steps.push({
          title: 'Addons',
          description: "",
          content: (
            <div>
              <h4 className="color-primary">ADDONS</h4>
              <Row type="flex" gutter={20}>
                {tourAddonsComputed.map((computed, index) => {
                  const tour_addon = computed.tour_addon
                  const tour_addon_value = computed.tour_addon_value
                  const options_computed = computed.options_computed
                  if (tour_addon) {
                    return (
                      <Col key={index} xs={24} xl={12}>
                        <Card
                          style={{ height: "100%" }}
                          bodyStyle={{ height: "100%" }}
                          cover={<FixedAspectRatio ratio="5:3" imageUrl={useOptimisedImage(tour_addon.image_url)} className="bg-color-8" />}
                        >
                          <h4 style={{ marginBottom: 0 }}>{tour_addon.name}</h4>
                          {tour_addon.description &&
                            <div
                              className="font-color-7"
                              dangerouslySetInnerHTML={{ __html: tour_addon.description.replace(/\n/g, '<br />') }}
                            />
                          }
                          <p />
                          <Radio.Group
                            value={tour_addon_value.option_id}
                            style={{ justifyContent: "flex-start" }}
                            onChange={(e) => {
                              tour_addon_value.option_id = e.target.value
                              onChange({ ...value })
                            }}
                          >
                            <Radio value="0">
                              {tour_addon.default_option}
                            </Radio>
                            {options_computed.map((option_computed, index2) => {
                              const priceOf = option_computed.price - computed.price
                              return (
                                <Radio key={index2} value={option_computed.option.id}>
                                  {option_computed.option.name}
                                  {priceOf > 0 &&
                                    <span style={{ opacity: .5 }}>
                                      &nbsp;({priceDisplay({ value: priceOf })})
                                    </span>
                                  }
                                </Radio>
                              )
                            })}
                          </Radio.Group>
                        </Card>
                      </Col>
                    )
                  }
                })}

                {value.generic_addons.map((generic_addon_value, index) => {
                  const generic_addon = genericAddonsIndexed[generic_addon_value.id]
                  return (
                    <Col key={index} xs={24} xl={12}>
                      <Card
                        style={{ height: "100%" }}
                        bodyStyle={{ height: "100%" }}
                        cover={<FixedAspectRatio ratio="5:3" imageUrl={useOptimisedImage(generic_addon.image_url)} className="bg-color-8" />}
                      >
                        <h4 style={{ marginBottom: 0 }}>{generic_addon.name}</h4>
                        {generic_addon.description &&
                          <div
                            className="font-color-7"
                            dangerouslySetInnerHTML={{ __html: generic_addon.description.replace(/\n/g, '<br />') }}
                          />
                        }
                        <p />
                        {generic_addon_value.options.map((option_value, index2) => {
                          const option = generic_addon.options.find(tour_option => tour_option.id === option_value.id)
                          return (
                            <div key={index2} style={{ display: "flex", flexWrap: "nowrap", justifyContent: "stretch", alignItems: "center", marginBottom: 10 }}>
                              <Select
                                style={{ width: 90 }}
                                value={option_value.quantity}
                                onChange={(e) => {
                                  option_value.quantity = e
                                  onChange({ ...value })
                                }}
                              >
                                <Select.Option value="0">0</Select.Option>
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                                <Select.Option value="4">4</Select.Option>
                                <Select.Option value="5">5</Select.Option>
                                <Select.Option value="6">6</Select.Option>
                                <Select.Option value="7">7</Select.Option>
                                <Select.Option value="8">8</Select.Option>
                                <Select.Option value="9">9</Select.Option>
                              </Select>
                              <div style={{ display: "inline-block", marginLeft: 10 }}>
                                {option.name} <span style={{ opacity: .5 }}>({formatCurrency(option.price)})</span>
                              </div>
                            </div>
                          )
                        })}
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </div>
          )
        })
      }

      return (
        <Form
          layout="horizontal"
          className="tc-tour-form"
          style={{ position: "relative" }}
        >
          <Row type="flex" gutter={40}>
            <Col xs={24} md={16} lg={18}>
              <div className="steps-content">
                {steps[this.state.currentStep].content}
              </div>
            </Col>
            <Col xs={24} md={8} lg={6}>
              <Steps
                direction="vertical"
                size="small"
                current={this.state.currentStep}
              >
                {steps.map((item, index) =>
                  <Steps.Step
                    key={item.title}
                    title={item.title}
                    description={<div dangerouslySetInnerHTML={{ __html: item.description }} />}
                    onClick={() => this.setState({ currentStep: index })}
                  />
                )}
              </Steps>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 20 }}>
                <Popover
                  content={<PriceBreakdown invoiceEntries={invoiceEntries} />}
                  title="Price Breakdown"
                  className="price-breakdown-popover"
                  placement="topRight"
                  trigger="click"
                >
                  <a style={{ fontSize: "1.2em", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    Total:
                    &nbsp;<strong>{formatCurrency(totalPrice)}</strong>
                    <Icon type="info-circle" style={{ fontSize: 12, marginLeft: 12 }} />
                  </a>
                </Popover>
              </div>

              <div className="steps-action">
                {this.state.currentStep > 0 &&
                  <Button
                    size="large"
                    onClick={() => {
                      onChange({ ...value })
                      this.prev()
                    }}
                  >
                    Previous
                  </Button>
                }
                {this.state.currentStep < steps.length - 1 &&
                  <Button
                    size="large"
                    type="primary"
                    onClick={() => {
                      onChange({ ...value })
                      this.next()
                    }}
                  >
                    Next
                  </Button>
                }
                {this.state.currentStep === steps.length - 1 &&
                  <Button
                    size="large"
                    type="primary"
                    onClick={() => this.props.onSubmit(value)}
                  >
                    Checkout
                  </Button>
                }
              </div>
            </Col>
          </Row>
        </Form>
      )
    }
  }
)

export const RoomForm = Form.create<{ tour, value?: Room, onChange?, form, index?, isFull?, numberOfSiblings?, deleteSelf?, className?, title?, limits?}>({
  onFieldsChange(props, changedFields) {
    if (props.onChange != null) props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    const value = props.value || { adult: 1 }
    return {
      adult: Form.createFormField(
        value.adult != null ? { value: value.adult } : { value: 1 }
      ),
      child_with_bed: Form.createFormField(
        value.child_with_bed != null ? { value: value.child_with_bed } : { value: 0 }
      ),
      child_no_bed: Form.createFormField(
        value.child_no_bed != null ? { value: value.child_no_bed } : { value: 0 }
      ),
      infant: Form.createFormField(
        value.infant != null ? { value: value.infant } : { value: 0 }
      )
    }
  }
})((props: { index?, form, tour, deleteSelf?, numberOfSiblings?, title?, value?: Room, onChange?, className?, style?, isFull?, limits?}) => {
  const isFull = props.isFull == null ? false : props.isFull
  const maxBeds = parseInt(props.tour['max_beds'])
  const maxAdults = parseInt(props.tour['max_adults'])
  const maxChildrenNoBed = parseInt(props.tour['max_children_no_bed'])
  const maxInfants = parseInt(props.tour['max_infants'])

  const allowRooms = props.tour.price_type === 'ALL' || props.tour.price_type.indexOf('SGL') !== -1
  const allowChildBed = props.tour.price_type === 'ALL' || props.tour.price_type.indexOf('CWB') !== -1
  const allowChildNoBed = props.tour.price_type === 'ALL' || allowRooms && allowChildBed && props.tour.price_type.indexOf('CNB') !== -1 && maxChildrenNoBed > 0
  const allowInfant = allowRooms && maxInfants > 0 && (props.tour.price_type === 'ALL' || props.tour.price_type.indexOf('INF') !== -1)

  const adult = props.form.getFieldValue('adult')
  const childBed = props.form.getFieldValue('child_with_bed')
  const childNoBed = props.form.getFieldValue('child_no_bed')
  const infant = props.form.getFieldValue('infant')

  const canAddAdult = isFull === false && (allowRooms === false || (adult < maxAdults && (adult + childBed) < maxBeds))
  const canAddChildBed = isFull === false && (allowRooms === false || ((adult + childBed) < maxBeds))
  const canAddChildNoBed = isFull === false && (childNoBed < maxChildrenNoBed && (adult + childBed) >= 2)
  const canAddInfant = infant < maxInfants
  const canSubtractChildBed = childBed > 0 && (childBed > 1 || childNoBed === 0)

  const autoTitle = allowRooms ? "Room " + (props.index + 1) : "Travellers"

  return (
    <Card
      className={"tc-room-form " + props.className}
      title={props.title || autoTitle}
      extra={props.numberOfSiblings > 1 && <a onClick={props.deleteSelf}>Delete</a>}
      style={props.style}
    >
      <Form.Item label={<div><span>{adult > 1 ? "Adults" : "Adult"}</span></div>}>
        <IncDecInput
          name="adult"
          form={props.form}
          min={props.limits?.min || 1}
          max={props.limits?.max || 9}
          allowAdd={canAddAdult}
        />
      </Form.Item>

      {allowChildBed &&
        <Form.Item label={<div><span>{allowRooms ? "Child with bed" : childBed === 1 ? "Child" : "Children"}</span></div>}>
          <IncDecInput
            name="child_with_bed"
            form={props.form}
            min={0}
            max={9}
            allowAdd={canAddChildBed}
            allowSubtract={canSubtractChildBed}
          />
        </Form.Item>
      }

      {allowChildNoBed &&
        <Form.Item label={<div><span>Child no bed</span></div>}>
          <IncDecInput
            name="child_no_bed"
            form={props.form}
            min={0}
            max={9}
            allowAdd={canAddChildNoBed}
          />
        </Form.Item>
      }

      {allowInfant &&
        <Form.Item label={<div><span>{infant > 1 ? "Infants" : "Infant"}</span></div>}>
          <IncDecInput
            name="infant"
            form={props.form}
            min={0}
            max={9}
            allowAdd={canAddInfant}
          />
        </Form.Item>
      }
    </Card>
  )
})

export const IncDecInput = (props: InputNumberProps & Omit<React.HTMLProps<HTMLDivElement>, 'form'> & { form?: WrappedFormUtils }) => {
  var getFieldDecorator = (_) => (x) => x
  var val
  var valProp: any = {}

  if (props.form == null) {
    val = props.value
    valProp.value = val
  } else {
    val = props.form.getFieldValue(props.name)
    getFieldDecorator = props.form.getFieldDecorator
  }

  const handleInc = () => {
    if (props.allowAdd != null && props.allowAdd === false) return
    val++
    if (props.max != null && val > props.max) val = props.max
    if (props.form != null) {
      props.form.setFieldsValue({
        [props.name]: val
      })
    }
    if (props.onChange != null) {
      props.onChange(val)
    }
  }

  const handleDec = () => {
    if (props.allowSubtract != null && props.allowSubtract === false) return
    val--
    if (props.min != null && val < props.min) val = props.min
    if (props.form != null) {
      props.form.setFieldsValue({
        [props.name]: val
      })
    }
    if (props.onChange != null) {
      props.onChange(val)
    }
  }

  const effectiveAllowAdd = props.allowAdd == null ? val < props.max : props.allowAdd && val < props.max
  const effectiveAllowSubtract = props.allowSubtract == null ? val > props.min : props.allowSubtract && val > props.min
  // var className = "disabled"
  // if (effectiveAllowAdd) className = ""
  // if (effectiveAllowSubtract) className = ""

  const style = props.style || {}

  // not sure why TypeScript freaks out if we don't cast to any
  // getFieldDecorator probably has some incorrect types
  return (
    <div style={style}>
      {getFieldDecorator(props.name)(
        <Input
          {...valProp}
          className="tc-inc-dec-input"
          type="number"
          addonAfter={<span className={effectiveAllowAdd ? "" : "disabled"} onClick={handleInc}><Icon type="plus-circle" theme="filled" /></span>}
          addonBefore={<span className={effectiveAllowSubtract ? "" : "disabled"} onClick={handleDec}><Icon type="minus-circle" theme="filled" /></span>}
          min={props.min}
          max={props.max}
          // prevent readonly warning
          onChange={() => { }}
        />
      )}
    </div> as any
  )
}