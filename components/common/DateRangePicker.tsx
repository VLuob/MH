import React from 'react'
import Picker from 'react-bootstrap-daterangepicker'
import moment from 'moment'
// you will need the css that comes with bootstrap@3. if you are using
// a tool like webpack, you can do the following:
// import 'bootstrap/dist/css/bootstrap.css';
// you will also need the css that comes with bootstrap-daterangepicker
import 'bootstrap-daterangepicker/daterangepicker.css';

const defaultProps = {
	showDropdowns: true,
	startDate: moment().subtract(6, 'days'),
	endDate: moment(),
	ranges: {
		'今天': [moment(), moment()],
		'昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
		// '最近7天': [moment().subtract(6, 'days'), moment()],
		// '最近30天': [moment().subtract(29, 'days'), moment()],
		'本周': [moment().startOf('week'), moment().endOf('week')],
		'本月': [moment().startOf('month'), moment().endOf('month')],
		'上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
		'近一个月': [moment().subtract(29, 'days'), moment()],
		'全部时间': [moment().subtract(1, 'years'), moment()],
	},
	locale: {
		format: 'YYYY-MM-DD',
		applyLabel: '确定',
		cancelLabel: '取消',
		customRangeLabel: '自定义',
		daysOfWeek: ['日','一','二','三','四','五','六'],
		monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
	}
}

const DateRangePicker = ({onApply, children, ...props}) => {
	return (
		<Picker
			{...props}
			applyClass="ant-btn ant-btn-primary"
			cancelClass="ant-btn"
			onApply={onApply}
		>
			{children}
		</Picker>
	)
}

DateRangePicker.defaultProps = defaultProps

export default DateRangePicker