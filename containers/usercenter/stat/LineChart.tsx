import React from 'react'
import { Line } from 'react-chartjs-2'



const defaultProps = {
	width: 600,
	height: 250,
	options: {
		responsive: true,
    legend: {
			display: false,
      position: 'bottom',
      labels: {}
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
	},
	report: [],
}

const getData = (report, label) => {
  const labels = []
  const statData = []

  
  for(let dateKey in report) {
    statData.push(report[dateKey])
    labels.push(dateKey)
  }


	const data = {
		labels,
		datasets : [
			{
				label: label,
				// borderWidth: 1,
				backgroundColor : "rgba(29,172,253, 0.5)",
				borderColor : "rgba(29, 172, 253, 1)",
				data : statData,
				fill: false,
			},
		]
	}

	return data

}

const Chart = ({width, height, options, report, scopeLabel}) => {
	const chartData = getData(report, scopeLabel)
	return (
		<Line 
			width={width}
			height={height}
			data={chartData}
			options={options} />
	)
}

Chart.defaultProps = defaultProps

export default Chart 