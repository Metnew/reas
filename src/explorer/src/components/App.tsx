import * as React from 'react';
import './App.css';
import { Network } from 'vis/index-network';



class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      networkConfig: {
        layoutMethod: "directed"
      },
      networkData: {},
      networkElement: null
    }
  }

  public destroyNetwork () {
    if (this.state.network !== null) {
      this.state.networkElement.destroy();
      this.state.networkElement = null;
    }
  }

  async public drawChart () {
    this.destroyNetwork()
    let networkData = await this.loadNetworkData()
    networkData = Object.keys(networkData).map((a) => data[a])
    let nodes = [];
    let edges = [];

    for (var i = 0; i < window.networkData.length; i++) {
      nodes.push({
        id: window.networkData[i].id,
        label: String(window.networkData[i].id)
      });
    }

    for (let i = 0; i < window.networkData.length; i++) {
      Object.keys(window.networkData[i].deps).forEach((elem) => {
        edges.push({
          to: elem,
          from: window.networkData[i].id
        });
      })
    }
    // create a network 
    var container = document.getElementById('mynetwork');
    var data = {
      nodes: nodes,
      edges: edges
    };

    var options = {
      layout: {
        hierarchical: {
          sortMethod: layoutMethod
        }
      },
      edges: {
        smooth: true,
        arrows: {
          to: true
        }
      }
    };
    network = new Network(container, data, options);
  }

  public componentDidMount () {
    this.loadNetworkData()
  }

  // public static getSnapshotBeforeUpdate () { }

  public async loadNetworkData () {
    fetch('./result.json')
      .then((res) => res.json())
      .then((networkData) => {
        console.log(networkData)
        this.setState({
          networkData
        })
      })
  }

  public render () {
    const { networkData } = this.state
    return (
      <div className="App">
        <h1>Hello!</h1>
        <div id="mynetwork"></div>
      </div>
    );
  }
}

export default App;
