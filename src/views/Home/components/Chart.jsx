import React from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import meetingImage from 'images/illustrations/calls.svg';
import styles from '../home.module.less';
// import 'chartjs-plugin-streaming';

const chartColors = {
  red: 'rgb(255, 99, 132)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  orange: 'rgb(255, 159, 64)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
  yellow: 'rgb(255, 205, 86)',
};

const chartColorsValues = _.values(chartColors);

const CityChart = (props) => {
  const { pollutionData, selected } = props;

  const options = {
    redraw: true,
    animation: {
      duration: 0,
      easing: 'easeInSine'
    },
    scales: {},
    config: {
      plugins: {
          streaming: false
      }
    }
  };

  let data = {};
  if(Array.isArray(selected) && selected.length === 1) {
    const cityName = selected[0];
    console.log(cityName);
    const cityData = _.cloneDeep(pollutionData[cityName]);
      const dataArray = _.map(cityData, (obj) => (obj.aqi));
      data.labels = _.map(cityData, (obj) => (dayjs(obj.receivedAt).format('HH:mm:ss')));
      data.datasets = [{
        type: 'line',
        label: `AQI for ${cityName}`,
        data: dataArray,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }]
  } else if(Array.isArray(selected) && selected.length > 1){
    _.set(options, 'scales.y.max', 400);
    const datasets = _.map(selected, (cityName, index) => {
      const cityData = _.cloneDeep(pollutionData[cityName]);
      const latestAQI = cityData[cityData.length - 1].aqi;
      return ({
        type: 'bar',
        label: cityName,
        data: [latestAQI],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: chartColorsValues[index % (chartColorsValues.length-1)]
      })
    })

    data = {
      labels: ['Latest Comparison'],
      datasets
    }
  }

  if(selected.length < 1) {
    return (
      <div className={styles.welcomeScreen}>
        <h5>Select a city to view its historical graph</h5>
        <img src={meetingImage} alt="Welcome" width="800" />
      </div>
    )
  }
  
  return (
    <div>
      <Line data={data} options={options} />
    </div>
  )
}

export default React.memo(CityChart);
