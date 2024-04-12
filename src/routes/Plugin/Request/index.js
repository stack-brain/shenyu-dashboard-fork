import React, { Component } from "react";
import { Table, Row, Col, Button, message, Popconfirm } from "antd";
import { connect } from "dva";
import Selector from "./Selector";
import Rule from "./Rule";
import { getCurrentLocale, getIntlContent } from "../../../utils/IntlUtils";
import AuthButton from "../../../utils/AuthButton";

@connect(({ request, global, loading }) => ({
  ...global,
  ...request,
  loading: loading.effects["global/fetchPlatform"]
}))
export default class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectorPage: 1,
      rulePage: 1,
      popup: "",
      localeName:''
    };
  }

  componentDidMount() {
    const { dispatch , plugins } = this.props;
    if(plugins && plugins.length > 0){
      this.getAllSelectors(1, plugins);
    }else{
      dispatch({
        type: "global/fetchPlugins",
        payload: {
          callback: (pluginList) => {
            this.getAllSelectors(1, pluginList);
          }
        }
      })
    }
  }

  getAllSelectors = (page, plugins) => {
    const { dispatch } = this.props;
    const pluginId = this.getPluginId(plugins, "request");
    dispatch({
      type: "request/fetchSelector",
      payload: {
        currentPage: page,
        pageSize: 12,
        pluginId
      }
    });
  };

  getAllRules = page => {
    const { dispatch, currentSelector } = this.props;
    const selectorId = currentSelector ? currentSelector.id : "";
    dispatch({
      type: "request/fetchRule",
      payload: {
        selectorId,
        currentPage: page,
        pageSize: 12
      }
    });
  };

  getPluginId = (plugins, name) => {
    const plugin = plugins.filter(item => {
      return item.name === name;
    });
    if (plugin && plugin.length > 0) {
      return plugin[0].id;
    } else {
      return "";
    }
  };

  closeModal = () => {
    this.setState({ popup: "" });
  };

  addSelector = () => {
    const { selectorPage } = this.state;
    const { dispatch, plugins } = this.props;
    const pluginId = this.getPluginId(plugins, "request");
    this.setState({
      popup: (
        <Selector
          pluginId={pluginId}
          handleOk={selector => {
            dispatch({
              type: "request/addSelector",
              payload: { pluginId, ...selector },
              fetchValue: { pluginId, currentPage: selectorPage, pageSize: 12 },
              callback: () => {
                this.closeModal();
              }
            });
          }}
          onCancel={this.closeModal}
        />
      )
    });
  };

  addRule = () => {
    const { rulePage } = this.state;
    const { dispatch, currentSelector } = this.props;
    if (currentSelector && currentSelector.id) {
      const selectorId = currentSelector.id;
      this.setState({
        popup: (
          <Rule
            handleOk={rule => {
              dispatch({
                type: "request/addRule",
                payload: { selectorId, ...rule },
                fetchValue: {
                  selectorId,
                  currentPage: rulePage,
                  pageSize: 12
                },
                callback: () => {
                  this.closeModal();
                }
              });
            }}
            onCancel={this.closeModal}
          />
        )
      });
    } else {
      message.destroy();
      message.warn(getIntlContent('SOUL.COMMON.WARN.INPUT_SELECTOR'));
    }
  };

  editSelector = record => {
    const { dispatch, plugins } = this.props;
    const { selectorPage } = this.state;
    const pluginId = this.getPluginId(plugins, "request");
    const { id } = record;
    dispatch({
      type: "request/fetchSeItem",
      payload: {
        id
      },
      callback: selector => {
        this.setState({
          popup: (
            <Selector
              {...selector}
              handleOk={values => {
                dispatch({
                  type: "request/updateSelector",
                  payload: {
                    pluginId,
                    ...values,
                    id
                  },
                  fetchValue: {
                    pluginId,
                    currentPage: selectorPage,
                    pageSize: 12
                  },
                  callback: () => {
                    this.closeModal();
                  }
                });
              }}
              onCancel={this.closeModal}
            />
          )
        });
      }
    });
  };

  deleteSelector = record => {
    const { dispatch, plugins } = this.props;
    const { selectorPage } = this.state;
    const pluginId = this.getPluginId(plugins, "request");
    dispatch({
      type: "request/deleteSelector",
      payload: {
        list: [record.id]
      },
      fetchValue: {
        pluginId,
        currentPage: selectorPage,
        pageSize: 12
      }
    });
  };

  pageSelectorChange = page => {
    const { plugins } = this.props;
    this.setState({ selectorPage: page });
    this.getAllSelectors(page, plugins);
  };

  pageRuleChange = page => {
    this.setState({ rulePage: page });
    this.getAllRules(page);
  };

  rowClick = record => {
    const { id } = record;
    const { dispatch } = this.props;
    dispatch({
      type: "request/saveCurrentSelector",
      payload: {
        currentSelector: record
      }
    });
    dispatch({
      type: "request/fetchRule",
      payload: {
        currentPage: 1,
        pageSize: 12,
        selectorId: id
      }
    });
  };

  editRule = record => {
    const { dispatch, currentSelector } = this.props;
    const { rulePage } = this.state;
    const selectorId = currentSelector ? currentSelector.id : "";
    const { id } = record;
    dispatch({
      type: "request/fetchRuleItem",
      payload: {
        id
      },
      callback: rule => {
        this.setState({
          popup: (
            <Rule
              {...rule}
              handleOk={values => {
                dispatch({
                  type: "request/updateRule",
                  payload: {
                    selectorId,
                    ...values,
                    id
                  },
                  fetchValue: {
                    selectorId,
                    currentPage: rulePage,
                    pageSize: 12
                  },
                  callback: () => {
                    this.closeModal();
                  }
                });
              }}
              onCancel={this.closeModal}
            />
          )
        });
      }
    });
  };

  deleteRule = record => {
    const { dispatch, currentSelector } = this.props;
    const { rulePage } = this.state;
    dispatch({
      type: "request/deleteRule",
      payload: {
        list: [record.id]
      },
      fetchValue: {
        selectorId: currentSelector.id,
        currentPage: rulePage,
        pageSize: 12
      }
    });
  };

  asyncClick = () => {
    const { dispatch, plugins } = this.props;
    const id = this.getPluginId(plugins, "request");
    dispatch({
      type: "global/asyncPlugin",
      payload: {
        id
      }
    });
  };

  changeLocales(locale) {
    this.setState({
      localeName: locale
    });
    getCurrentLocale(this.state.localeName);
  }

  render() {
    const { popup, selectorPage, rulePage } = this.state;
    const {
      selectorList,
      ruleList,
      selectorTotal,
      ruleTotal,
      currentSelector
    } = this.props;
    const selectColumns = [
      {
        align: "center",
        title: getIntlContent("SOUL.PLUGIN.SELECTOR.LIST.COLUMN.NAME"),
        dataIndex: "name",
        key: "name"
      },
      {
        align: "center",
        title: getIntlContent("SOUL.COMMON.OPEN") ,
        dataIndex: "enabled",
        key: "enabled",
        render: text => {
          if (text) {
            return <div className="open">{getIntlContent("SOUL.COMMON.OPEN")}</div>;
          } else {
            return <div className="close">{getIntlContent("SOUL.COMMON.CLOSE")}</div>;
          }
        }
      },
      {
        align: "center",
        title: getIntlContent("SOUL.COMMON.OPERAT"),
        dataIndex: "operate",
        key: "operate",
        render: (text, record) => {
          return (
            <div>
              <span
                style={{ marginRight: 8 }}
                className="edit"
                onClick={e => {
                  e.stopPropagation();
                  this.editSelector(record);
                }}
              >
                {getIntlContent("SOUL.COMMON.CHANGE")}
              </span>
              <AuthButton perms="plugin:requestSelector:delete">
                <Popconfirm
                  title={getIntlContent("SOUL.COMMON.DELETE")}
                  placement='bottom'
                  onCancel={(e) => {
                    e.stopPropagation()
                  }}
                  onConfirm={(e) => {
                    e.stopPropagation()
                    this.deleteSelector(record);
                  }}
                  okText={getIntlContent("SOUL.COMMON.SURE")}
                  cancelText={getIntlContent("SOUL.COMMON.CALCEL")}
                >
                  <span
                    className="edit"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {getIntlContent("SOUL.COMMON.DELETE.NAME")}
                  </span>
                </Popconfirm>
              </AuthButton>
            </div>
          );
        }
      }
    ];

    const rulesColumns = [
      {
        align: "center",
        title: getIntlContent("SOUL.COMMON.RULE.NAME"),
        dataIndex: "name",
        key: "name"
      },
      {
        align: "center",
        title: getIntlContent("SOUL.COMMON.OPEN"),
        dataIndex: "enabled",
        key: "enabled",
        render: text => {
          if (text) {
            return <div className="open">{getIntlContent("SOUL.COMMON.OPEN")}</div>;
          } else {
            return <div className="close">{getIntlContent("SOUL.COMMON.CLOSE")}</div>;
          }
        }
      },
      {
        align: "center",
        title: getIntlContent("SOUL.SYSTEM.UPDATETIME"),
        dataIndex: "dateCreated",
        key: "dateCreated"
      },
      {
        align: "center",
        title: getIntlContent("SOUL.COMMON.OPERAT"),
        dataIndex: "operate",
        key: "operate",
        render: (text, record) => {
          return (
            <div>
              <span
                className="edit"
                style={{ marginRight: 8 }}
                onClick={e => {
                  e.stopPropagation();
                  this.editRule(record);
                }}
              >
                {getIntlContent("SOUL.COMMON.CHANGE")}
              </span>
              <AuthButton perms="plugin:requestRule:delete">
                <Popconfirm
                  title={getIntlContent("SOUL.COMMON.DELETE")}
                  placement='bottom'
                  onCancel={(e) => {
                    e.stopPropagation()
                  }}
                  onConfirm={(e) => {
                    e.stopPropagation()
                    this.deleteRule(record);
                  }}
                  okText={getIntlContent("SOUL.COMMON.SURE")}
                  cancelText={getIntlContent("SOUL.COMMON.CALCEL")}
                >
                  <span
                    className="edit"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {getIntlContent("SOUL.COMMON.DELETE.NAME")}
                  </span>
                </Popconfirm>
              </AuthButton>
            </div>
          );
        }
      }
    ];

    return (
      <div className="plug-content-wrap">
        <Row gutter={20}>
          <Col span={8}>
            <div className="table-header">
              <h3>{getIntlContent("SOUL.PLUGIN.SELECTOR.LIST.TITLE")}</h3>
              <AuthButton perms="plugin:requestSelector:add">
                <Button type="primary" onClick={this.addSelector}>
                  {getIntlContent("SOUL.PLUGIN.SELECTOR.LIST.ADD")}
                </Button>
              </AuthButton>
            </div>
            <Table
              size="small"
              onRow={record => {
                return {
                  onClick: () => {
                    this.rowClick(record);
                  }
                };
              }}
              style={{ marginTop: 30 }}
              bordered
              columns={selectColumns}
              dataSource={selectorList}
              pagination={{
                total: selectorTotal,
                current: selectorPage,
                pageSize: 12,
                onChange: this.pageSelectorChange
              }}
              rowClassName={item => {
                if (currentSelector && currentSelector.id === item.id) {
                  return "table-selected";
                } else {
                  return "";
                }
              }}
            />
          </Col>
          <Col span={16}>
            <div className="table-header">
              <div style={{ display: "flex" }}>
                <h3 style={{ marginRight: 30 }}>{getIntlContent("SOUL.PLUGIN.SELECTOR.RULE.LIST")}</h3>
                <AuthButton perms="plugin:request:modify">
                  <Button icon="reload" onClick={this.asyncClick} type="primary">
                    {getIntlContent("SOUL.COMMON.SYN")} request
                  </Button>
                </AuthButton>
              </div>
              <AuthButton perms="plugin:requestRule:add">
                <Button type="primary" onClick={this.addRule}>
                  {getIntlContent("SOUL.COMMON.ADD.RULE")}
                </Button>
              </AuthButton>
            </div>
            <Table
              size="small"
              style={{ marginTop: 30 }}
              bordered
              columns={rulesColumns}
              expandedRowRender={record => <span style={{ wordBreak:'break-all', width:'100%'}}>{record.handle}</span>}
              dataSource={ruleList}
              pagination={{
                total: ruleTotal,
                current: rulePage,
                pageSize: 12,
                onChange: this.pageRuleChange
              }}
            />
          </Col>
        </Row>
        {popup}
      </div>
    );
  }
}
