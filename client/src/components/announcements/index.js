import React, { Component } from 'react';
import ReactTable from 'react-table';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import axios from 'axios';

export default class index extends Component {
  state = {
    bannerData: [],
  };
  componentDidMount = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/bannerMsg/allBannerText`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((res) => {
        res.data && this.setState({ bannerData: res.data });
      })
      .catch((e) => {
        console.log(e, 'e');
      });
  };

  render() {
    return (
      <div>
        <h3> Announcements</h3>
        <div>
          <Card>
            <CardBody>
              <ReactTable
                data={this.state.bannerData}
                columns={[
                  {
                    Header: 'Messages',
                    show: true,
                    id: 'bannerText',
                    accessor: (d) => d,
                    Cell: (props) => {
                      return <div>{props.value.bannerText}</div>;
                    },
                    headerStyle: {
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#000000',

                      textAlign: 'left',
                    },
                  },
                  {
                    Header: 'CreatedAt',
                    show: true,
                    id: 'createdAt',
                    accessor: (d) => d,
                    Cell: (props) => {
                      return <div>{props.value.createdAt}</div>;
                    },
                    headerStyle: {
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#000000',
                      textAlign: 'left',
                    },
                  },
                ]}
                resizable={false}
                defaultPageSize={500}
                minRows={1}
                showPagination={false}
              ></ReactTable>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}
