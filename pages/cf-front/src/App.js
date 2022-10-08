import React, { useState, useEffect } from 'react';
import './App.css';
import moment from 'moment';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import '@inovua/reactdatagrid-community/theme/default-dark.css';
import { Area, AreaChart, Label, LineChart, Line,  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function App() {
  const [trafficData, setTrafficData] = useState(null);
  const [domains, setDomains] = useState([]);
  const [attacks, setAttacks] = useState(null);
  const [attacksLine, setAttacksLine] = useState(null);
  const [trafficLine, setTrafficLine] = useState(null);

  // get data from API on page load
  useEffect(() => {
    // fetch data from API send no cors headers
    fetch("https://cf-api.nvadlamudi.workers.dev/popular-domains", {
      // pass through proxy to avoid cors headers
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(JSON.parse(data));
      setDomains(JSON.parse(data));
    });

    fetch("https://cf-api.nvadlamudi.workers.dev/attack-layer3", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(JSON.parse(data));
      setAttacks(JSON.parse(data));
    });

    fetch("https://cf-api.nvadlamudi.workers.dev/traffic-change", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(JSON.parse(data));
      setTrafficData(JSON.parse(data));
    });

  }, []);

  useEffect(() => {
    if(attacks){
      const attacksLine = attacks[0].total.timestamps.map((stamp,i) => {
        return {
          timestamps: moment(stamp).format('MMMM Do, h a'),
          values: Math.round(attacks[0].total.values[i] * 10000) / 100
        }
      })
      setAttacksLine(attacksLine);
    }
  }, [attacks]);

  useEffect(() => {
    if(trafficData){
      const trafficLines = trafficData[0].total.timestamps.map((stamp,i) => {
        return {
          timestamps: moment(stamp).format('MMMM Do, h a'),
          values: Math.round(trafficData[0].total.values[i] * 10000) / 100
        }
      })
      setTrafficLine(trafficLines);
      console.log(trafficLines);
    }
  }, [trafficData]);

  const columns = [
    { name : 'rank', header : 'Rank', defaultFlex: 1, render: ({ value }) => value + 1 },
    { name: 'domain', header: 'Domain', defaultFlex: 1, render: ({value}) => renderLink(value) },
    { name : 'rankChange', header : 'Rank Change', defaultFlex: 1, render: ({value}) => rankColor(value) },
  ]

  const renderLink = (value) => {
    return (
      <div>
        {/* Text with button inline */}
        <a href={`https://${value}`} target="_blank" rel="noopener noreferrer">{value}</a>
      </div>
    )
  }

  const rankColor = (value) => {
    let color = 'gray';
    if (value > 0) color = 'green';
    if (value < 0) color = 'red';
    return (
      <div style={{ color: color}}>
        {value}
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{"background" : "balck", "opacity": "0.75"}}>
        <p className="label">{`Time : ${payload[0].payload.timestamps}`}</p>
          <p className="label">{`Attack % : ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
    }

    const CustomTooltipTraffic = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip" style={{"background" : "balck", "opacity": "0.75"}}>
          <p className="label">{`Time : ${payload[0].payload.timestamps}`}</p>
            <p className="label">{`Traffic % : ${payload[0].value}`}</p>
          </div>
        );
      }
    
      return null;
      }

  return (
    <div className="App App-header">
      <section className="section1" style={{"width" : "100%", paddingBottom : '2rem'}}>
        <h1>Current Traffic Change</h1>
        <div style={{"width" : "75%", "height" : "30rem", "margin" : "0 auto"}}  >
        <ResponsiveContainer width="100%" height="100%" >
          <AreaChart
            data={trafficLine ? trafficLine : []}
            width={800}
            height={500}
          >
            <defs>
              <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamps" scale={'band'} tick={false} >
              <Label value="Time" offset={0} position="insideBottom" style={{
                textAnchor: 'middle',
                fontSize: '1.5rem',
                fill: 'gray',
                paddingBottom: '1rem'
              }} />
            </XAxis>
            <YAxis tick={false}>
            <Label
              style={{
                textAnchor: "top",
                fontSize: "100%",
                fill: "gray",
                }}
              angle={270} 
              value={"Traqffic Change %"} />
            </YAxis>
            <Tooltip content={<CustomTooltipTraffic />} />
            <Area type="monotone" dataKey="values" stroke="#82ca9d" activeDot={{ r: 8 }} fillOpacity={1} fill="url(#colorT)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="section2" style={{"width" : "75%"}}>
        <h1>Popular Domains</h1>
        <ReactDataGrid
          idProperty="rank"
          columns={columns}
          dataSource={domains ? domains : []}
          style={{ minHeight: 550 }}
          theme="default-dark"
          
        />
      </section>
      <section className="section3" style={{"width" : "100%", paddingBottom : '2rem'}}>
        <h1>Layer 3 DDoS Attacks</h1>
        <div style={{"width" : "75%", "height" : "30rem", "margin" : "0 auto"}}  >
        <ResponsiveContainer width="100%" height="100%" >
          <AreaChart
            data={attacksLine ? attacksLine : []}
            width={800}
            height={500}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamps" scale={'band'} tick={false} >
              <Label value="Time" offset={0} position="insideBottom" style={{
                textAnchor: 'middle',
                fontSize: '1.5rem',
                fill: 'gray',
                paddingBottom: '1rem'
              }} />
            </XAxis>
            <YAxis tick={false}>
            <Label
              style={{
                textAnchor: "top",
                fontSize: "100%",
                fill: "gray",
                }}
              angle={270} 
              value={"Attack %"} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="values" stroke="#8884d8" activeDot={{ r: 8 }} fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>    
    </div>
  );
}

export default App;
