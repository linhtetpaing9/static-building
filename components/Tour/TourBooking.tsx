import React from "react"
import Big from "big.js"
import Calendar from "travelcloud-antd/components/calendar"
import { Form, Button, Icon, List, Steps, Popover, Radio, Select } from "antd"
import { dateToIsoDate, formatCurrency, extractValueFromFormState } from "travelcloud-antd/travelcloud"
import { createTourBookingForm, TourBookingContext, RoomForm } from "travelcloud-antd/components/tour-booking"

export const TourBookingForm = createTourBookingForm(
  class extends React.Component<TourBookingContext> {
    state = {
      visible: false
    }

    handleVisibleChange = (visible) => {
      this.setState({ visible });
    }

    hide = () => {
      this.setState({ visible: false })
    }

    render() {
      const { tour, value, onChange, selectedOptionDateInfoMap, allowRooms, selectedOption, totalPrice, invoiceEntries, tourOptionsWithCheapestComputed, tourFormHasAddons, tourAddonsComputed } = this.props

      const stepStatus = (stepNum: number, current: number) => {
        if (current < stepNum) return 'wait'
        if (current > stepNum) return 'finish'
        return 'process'
      }

      if (tour == null || tour.options.length === 0) {
        return <div style={{ textAlign: 'center', padding: 64 }}>Departure details coming soon.<br />Please check back later.</div>
      }

      // not sure why but the grid={gutter: 16} doesn't work on List
      // we pad List.Item manually here
      var roomList = []
      const optionSelected = tour.options.find((option) => option.id === value.option_id)
      const departureSelected = optionSelected == null ? null : optionSelected.departures.find((departure) => departure.date === value.departure_date)
      const availableSlots = departureSelected == null ? null : parseInt(departureSelected.slots_total) - parseInt(departureSelected.slots_taken)
      const currentTotal = value.rooms.reduce((acc, room) => {
        if (room.adult != null) acc += parseInt('' + room.adult)
        if (room.child_with_bed != null) acc += parseInt('' + room.child_with_bed)
        if (room.child_no_bed != null) acc += parseInt('' + room.child_no_bed)
        return acc
      }, 0)

      const isFull = optionSelected != null && currentTotal >= availableSlots && optionSelected.on_demand_advance_booking === '0'

      if (optionSelected != null) {
        roomList = value.rooms.map((item, index) =>
          <List.Item style={{ padding: 8 }}>
            <RoomForm
              tour={tour}
              value={item}
              index={index}
              isFull={isFull}
              numberOfSiblings={value.rooms.length}
              deleteSelf={() => {
                value.rooms.splice(index, 1)
                onChange(Object.assign({}, value))
              }}
              onChange={(formChanges) => {
                const changes = extractValueFromFormState(formChanges)
                value.rooms[index] = Object.assign({}, value.rooms[index], changes)
                onChange(Object.assign({}, value))
              }} /></List.Item>)

        // there's no way to align height using List, so we generate a dummy RoomForm for the 'add room' button
        if (value.rooms.length < 4 && allowRooms) roomList.push(
          <List.Item style={{ padding: 8 }}>
            <RoomForm className="tc-blur-hide-inputs" tour={tour} title="New room" />
            <Button
              type="primary"
              style={{ position: 'absolute', top: '50%', width: '70%', left: '15%' }}
              onClick={
                () => {
                  value.rooms.push({ adult: 1 })
                  onChange(Object.assign({}, value))
                }}>
              Add room
              </Button>
          </List.Item>)
      }

      const genericAddonsIndexed = tour.generic_addons.reduce((acc, generic_addon) => {
        acc[generic_addon.id] = generic_addon
        return acc
      }, {})

      const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      };

      const displayPrice = (price) => {
        if (parseFloat(price) == 0) return ''
        return ' (' + formatCurrency(price) + ')'
      }

      var currentStep
      if (value.option_id == '') currentStep = 1
      else if (value.departure_date == '') currentStep = 2
      else if (value.rooms_selected !== true) currentStep = 3
      else currentStep = 4
      return <Form layout="horizontal" className="tc-tour-form" style={{ position: 'relative' }}>
        <div className="tc-steps-clickable" style={{ borderBottom: "1px solid #e8e8e8", flex: '0' }}>
          <Steps size="small" style={{ padding: 32 }}>
            <Steps.Step status={stepStatus(1, currentStep)} onClick={() => onChange(Object.assign({}, value, { option_id: '', departure_date: '' }))} title="Tour options" description={selectedOption != null ? selectedOption.name : ''} />
            <Steps.Step status={stepStatus(2, currentStep)} title="Departure dates" onClick={() => onChange(Object.assign({}, value, { departure_date: '' }))} description={value.departure_date} />
            <Steps.Step status={stepStatus(3, currentStep)} title="Travellers" onClick={() => onChange(Object.assign({}, value, { rooms_selected: false }))} description={value.rooms_selected === true ? "Selected" : ""} />
            {tourFormHasAddons && <Steps.Step status={stepStatus(4, currentStep)} title="Addons" />}
          </Steps>
        </div>
        {currentStep === 1
          && <List
            size="large"
            grid={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
            dataSource={tourOptionsWithCheapestComputed || tour.options}
            renderItem={(option: any) => {
              return <List.Item key={option.id} style={{ lineHeight: '24px', padding: '24px 30px' }}>
                <h2>{option.name}</h2>
                {option['_next_departure'] != null && <div>Next departure on <b>{option['_next_departure']}</b></div>}
                {option['_cheapest_computed'] == null
                  ? <div>Prices from {option['TWN']}</div>
                  : (option['_cheapest_computed'].beforeDiscounts.eq(option['_cheapest_computed'].afterDiscounts)
                    ? <div>Prices from <b>${option['_cheapest_computed'].beforeDiscounts.toFixed(0)}</b></div>
                    : <div>Prices from <span style={{ textDecoration: 'line-through' }}>${option['_cheapest_computed'].beforeDiscounts.toFixed(0)}</span> <b>${option['_cheapest_computed'].afterDiscounts.toFixed(0)}</b></div>
                  )}
                {option['_next_departure'] == null
                  ? <Button style={{ marginTop: 6 }} disabled>No departures available</Button>
                  : <Button style={{ marginTop: 6 }} type="primary" onClick={() => onChange(Object.assign({}, value, { option_id: option.id }))}>View departures <Icon type="right" /></Button>}
              </List.Item>
            }} />
        }

        {currentStep === 2
          && <Calendar
            className="tour-calendar"
            validRange={[new Date(selectedOption['_next_departure']), new Date(selectedOption['_last_departure'])]}
            CalendarDayGenerator={(date, isPadding, key) => {
              const isoDate = dateToIsoDate(date)

              // if a month does not end on a sat, additional days are drawn to pad out the week
              // if isPadding, we pretned there's no dayInfo and don't display any info
              const dayInfo = isPadding ? {} : selectedOptionDateInfoMap[isoDate] || {} as any
              const { disabled = true, afterDiscounts, noDeparture = true, slotsRemaining } = dayInfo

              return <td role="gridcell" key={key}
                className={"ant-fullcalendar-cell" + (disabled ? " ant-fullcalendar-disabled-cell" : "")}
                onClick={() => disabled === false && onChange(Object.assign({}, value, { departure_date: isoDate }))}>
                <div className="ant-fullcalendar-date">
                  <div className="ant-fullcalendar-value">{date.getDate()}</div>
                  {noDeparture
                    ? <div className="ant-fullcalendar-content"></div>
                    : <div className="ant-fullcalendar-content">
                      <div>{formatCurrency(afterDiscounts)}</div>
                      {slotsRemaining != null && <div>{slotsRemaining} available</div>}
                    </div>}
                </div>
              </td>
            }}
          />}

        {currentStep === 3
          && <div style={{ flex: '1' }}>
            <List
              grid={{ xs: 1, md: allowRooms ? 2 : 1 }}
              dataSource={roomList}
              renderItem={item => item} />
          </div>}

        {currentStep === 4
          && <div style={{ padding: "24px 30px", flex: '1', overflowY: 'auto' }}>
            {tourAddonsComputed.map((computed, index) => {
              const tour_addon = computed.tour_addon
              const tour_addon_value = computed.tour_addon_value
              const options_computed = computed.options_computed

              return <div key={index} style={{ marginBottom: 20 }}>
                <h2>{tour_addon.name}</h2>
                <Radio.Group value={tour_addon_value.option_id} onChange={(e) => {
                  tour_addon_value.option_id = e.target.value;
                  onChange({ ...value })
                }}>
                  <Radio style={radioStyle} value="0">{tour_addon.default_option} {displayPrice(computed.price_diff)}</Radio>
                  {options_computed.map((option_computed, index2) => <Radio key={index2} style={radioStyle} value={option_computed.option.id}>{option_computed.option.name} {displayPrice(option_computed.price_diff)}</Radio>)}

                </Radio.Group>
              </div>
            })}

            {value.generic_addons.map((generic_addon_value, index) => {
              const generic_addon = genericAddonsIndexed[generic_addon_value.id]

              return <div key={index} style={{ marginBottom: 20 }}>
                <h2>{generic_addon.name}</h2>
                {generic_addon_value.options.map((option_value, index2) => {

                  const option = generic_addon.options.find((tour_option) => tour_option.id === option_value.id)

                  return <div key={index2}>
                    <Select style={{ width: 60 }} value={option_value.quantity} onChange={(e) => {
                      option_value.quantity = e;
                      onChange({ ...value })
                    }}>
                      <Select.Option value="0">0</Select.Option>
                      <Select.Option value="1">1</Select.Option>
                      <Select.Option value="2">2</Select.Option>
                      <Select.Option value="3">3</Select.Option>
                      <Select.Option value="4">4</Select.Option>
                      <Select.Option value="5">5</Select.Option>
                    </Select>
                    <div style={{ display: 'inline-block', marginLeft: 10 }}>
                      {option.name} ({formatCurrency(option.price)})
                        </div>

                  </div>
                })}
              </div>
            })}
          </div>}

        {currentStep > 2 && <div style={{ borderTop: "1px solid #e8e8e8", flex: '0', bottom: 0, padding: 20, width: '100%' }}>
          <div style={{ float: 'left', fontSize: 18, lineHeight: "32px" }}>
            Total: <b>{formatCurrency(totalPrice)}</b>
            <Popover
              content={
                <table style={{ width: 400 }}><tbody>{invoiceEntries.reduce(
                  (acc, group, groupIndex) => {
                    acc.push(<tr key={groupIndex}><th style={{ paddingTop: 8 }} colSpan={2}>{group[0]}</th></tr>)
                    for (var i in group[1]) {
                      const line = group[1][i]
                      acc.push(<tr key={groupIndex + " " + i}><td style={{ width: "99%" }}>{line.name} x{line.quantity}</td><td>${Big(line.price).times(line.quantity).toFixed(2).toString()}</td></tr>)
                    }
                    return acc
                  }, [])}
                </tbody></table>}
              title="Price Breakdown"
              trigger="click"
              visible={this.state.visible}
              onVisibleChange={this.handleVisibleChange}>
              <a style={{ color: '#999', marginLeft: 32 }}><Icon type="info-circle-o" /> Details</a>
            </Popover>
          </div>
          <Button type="primary" style={{ float: 'right' }} onClick={() => {
            if (currentStep === 3 && tourFormHasAddons && value.rooms_selected !== true) {
              onChange({ ...value, rooms_selected: true })
            }
            else {
              this.props.onSubmit(value)
            }
          }}>Next step &gt;</Button>
        </div>}
      </Form>
    }
  }
)