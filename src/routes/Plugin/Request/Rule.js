import React, { Component } from "react";
import { Tabs, Row, Col, Modal, Form, Select, Input, Switch, Button, message } from "antd";
import { connect } from "dva";
import classnames from "classnames";
import styles from "../index.less";
import { getIntlContent } from "../../../utils/IntlUtils";

const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
@connect(({ global }) => ({
  platform: global.platform
}))
class AddModal extends Component {
  constructor(props) {
    super(props);
    const ruleConditions = props.ruleConditions || [
      {
        paramType: "uri",
        operator: "=",
        paramName: "/",
        paramValue: ""
      }
    ];
    let 
      callBackUri=""
      ;
    if (props.handle) {
      const myHandle = JSON.parse(props.handle);
      
      callBackUri = myHandle.callBackUri;
    }
    let headerOperateType = [
      {
        label: "addHeaders",
        value: "addHeaders"
      },
      {
        label: "replaceHeaderKeys",
        value: "replaceHeaderKeys"
      },
      {
        label: "setHeaders",
        value: "setHeaders"
      },
      {
        label: "removeHeaderKeys",
        value: "removeHeaderKeys"
      },
    ]
    let parameterOperateType = [
      {
        label: "addParameters",
        value: "addParameters"
      },
      {
        label: "replaceParameterKeys",
        value: "replaceParameterKeys"
      },
      {
        label: "setParameters",
        value: "setParameters"
      },
      {
        label: "removeParameterKeys",
        value: "removeParameterKeys"
      },
    ]

    let cookieOperateType = [
      {
        label: "addCookies",
        value: "addCookies"
      },
      {
        label: "replaceCookieKeys",
        value: "replaceCookieKeys"
      },
      {
        label: "setCookies",
        value: "setCookies"
      },
      {
        label: "removeCookieKeys",
        value: "removeCookieKeys"
      },
    ]

    let currentType = "parameter"

    this.state = {
      callBackUri,
      headerOperateType,
      parameterOperateType,
      cookieOperateType,
      currentType
    };

    ruleConditions.forEach((item, index) => {
      const { paramType } = item;

      let key = `paramTypeValueEn${index}`;
      if (paramType === "uri" || paramType === "host" || paramType === "ip") {
        this.state[key] = true;
        ruleConditions[index].paramName = "/";
      } else {
        this.state[key] = false;
      }
    });

    this.state.ruleConditions = ruleConditions;
    this.initList(props);
  }


  handleTabChange = (currentType) => {
    this.setState({
      currentType
    })
  }
  
  handleAddRow = (type) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    let list = this.state[`${type}List`];
    let strs = list[list.length - 1][0].fieldName.split("_");
    // eslint-disable-next-line radix
    let index = parseInt(strs[strs.length - 1]) + 1;

    let defaultFieldType = this.state[`${type}OperateType`][0].value;
    list.push(
      [
        { fieldLabel: "OperateType", fieldName: `${type}_type_${index}`, fieldValue: defaultFieldType },
        { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${type.toUpperCase()}.KEY`), fieldName: `${type}_key_${index}`, fieldValue: null },
        { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${type.toUpperCase()}.VALUE`), fieldName: `${type}_value_${index}`, fieldValue: null },
      ]
    )
    this.setState({
      [`${type}List`]: list
    })
  }

  handleDeleteRow = (type, rowIndex) => {
    if (rowIndex === 0) {
      return;
    }
    // eslint-disable-next-line react/no-access-state-in-setstate
    let list = this.state[`${type}List`];
    list.splice(rowIndex, 1);
    this.setState({
      [`${type}List`]: list
    })
  }

  initList = (props) => {
    let handle = props.handle && JSON.parse(props.handle);
    this.state.parameterList = this.initListByType(handle, "parameter");
    this.state.headerList = this.initListByType(handle, "header");
    this.state.cookieList = this.initListByType(handle, "cookie");
  }

  initListByType = (handle, dataType) => {
    let dataTypeFirstUpper = dataType.substring(0, 1).toUpperCase() + dataType.substring(1, dataType.length);
    let dataTypeUpper = dataType.toUpperCase();
    let addFields = `add${dataTypeFirstUpper}s`;
    let replaceFieldKeys = `replace${dataTypeFirstUpper}Keys`;
    let setFields = `set${dataTypeFirstUpper}s`;
    let removeFields = `remove${dataTypeFirstUpper}Keys`;
    let list = [
      [
        { fieldLabel: "OperateType", fieldName: `${dataType}_type_0`, fieldValue: `add${dataTypeFirstUpper}s` },
        { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.KEY`), fieldName: `${dataType}_key_0`, fieldValue: null },
        { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.VALUE`), fieldName: `${dataType}_value_0`, fieldValue: null },
      ]
    ];
    if (handle && handle[dataType] && (
      (handle[dataType][addFields]&&Object.keys(handle[dataType][addFields]).length > 0) ||
      (handle[dataType][replaceFieldKeys] && Object.keys(handle[dataType][replaceFieldKeys]).length > 0) ||
      (handle[dataType][setFields] && Object.keys(handle[dataType][setFields]).length > 0) ||
      (handle[dataType][removeFields] && handle[dataType][removeFields].length > 0)
    )) {
      list = [];
      let index = 0;
      // eslint-disable-next-line no-unused-expressions
      handle[dataType][addFields] && Object.keys(handle[dataType][addFields]).length > 0 && Object.keys(handle[dataType][addFields]).forEach((e) => {
        let v = handle[dataType][addFields][e];
        list.push([
          { fieldLabel: "OperateType", fieldName: `${dataType}_type_${index}`, fieldValue: `add${dataTypeFirstUpper}s` },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.KEY`), fieldName: `${dataType}_key_${index}`, fieldValue: e },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.VALUE`), fieldName: `${dataType}_value_${index}`, fieldValue: v },
        ]);
        index += 1;
      })
      // eslint-disable-next-line no-unused-expressions
      handle[dataType][replaceFieldKeys] && Object.keys(handle[dataType][replaceFieldKeys]).length > 0 && Object.keys(handle[dataType][replaceFieldKeys]).forEach((e) => {
        let v = handle[dataType][replaceFieldKeys][e];
        list.push([
          { fieldLabel: "OperateType", fieldName: `${dataType}_type_${index}`, fieldValue: `replace${dataTypeFirstUpper}Keys` },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.OLD.KEY`), fieldName: `${dataType}_key_${index}`, fieldValue: e },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.NEW.KEY`), fieldName: `${dataType}_value_${index}`, fieldValue: v },
        ])
        index += 1;
      })
      // eslint-disable-next-line no-unused-expressions
      handle[dataType][setFields] && Object.keys(handle[dataType][setFields]).length > 0 && Object.keys(handle[dataType][setFields]).forEach((e) => {
        let v = handle[dataType][setFields][e];
        list.push([
          { fieldLabel: "OperateType", fieldName: `${dataType}_type_${index}`, fieldValue: `set${dataTypeFirstUpper}s` },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.KEY`), fieldName: `${dataType}_key_${index}`, fieldValue: e },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.VALUE`), fieldName: `${dataType}_value_${index}`, fieldValue: v },
        ])
        index += 1;
      })
      let removeKeys = [];
      // eslint-disable-next-line no-unused-expressions
      (handle[dataType][removeFields] && handle[dataType][removeFields].length > 0) && handle[dataType][removeFields].forEach((e, i) => {
        if (i % 2 === 0) {
          removeKeys.push([]);
        }
        removeKeys[removeKeys.length - 1].push(e);
      });
      // eslint-disable-next-line no-unused-expressions
      (removeKeys && removeKeys.length > 0) && removeKeys.forEach((e) => {
        let dataItem = [
          { fieldLabel: "OperateType", fieldName: `${dataType}_type_${index}`, fieldValue: `remove${dataTypeFirstUpper}Keys` },
          { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.KEY`), fieldName: `${dataType}_key_${index}`, fieldValue: e[0] }
        ];
        if (e[1]) {
          dataItem.push(
            { fieldLabel: getIntlContent(`SOUL.PLUGIN.REQUEST.${dataTypeUpper}.KEY`), fieldName: `${dataType}_value_${index}`, fieldValue: e[1] }
          )
        }
        list.push(dataItem)
        index += 1;
      })
    }
    return list;
  }

  getData = (formValues) => {
    let handle = {
      header: {
        addHeaders: {},
        replaceHeaderKeys: {},
        setHeaders: {},
        removeHeaderKeys: []
      },
      parameter: {
        addParameters: {},
        replaceParameterKeys: {},
        setParameters: {},
        removeParameterKeys: []
      },
      cookie: {
        addCookies: {},
        replaceCookieKeys: {},
        setCookies: {},
        removeCookieKeys: []
      }
    };
    this.buildData(handle, formValues, "parameter");
    this.buildData(handle, formValues, "header");
    this.buildData(handle, formValues, "cookie");
    return JSON.stringify(handle);
  }

  buildData = (handle, formValues, dataType) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    let list = this.state[`${dataType}List`];
    list.forEach(row => {
      let type = formValues[row[0].fieldName];
      let value1 = row[1]&&formValues[row[1].fieldName];
      let value2 = row.length>2&&formValues[row[2].fieldName];
      if (!type.startsWith("remove") && value1 && value2) {
        handle[dataType][type][value1] = value2
      }
      if (type.startsWith("remove")) {
        if (value1) {
          handle[dataType][type].push(value1)
        }
        if (value2) {
          handle[dataType][type].push(value2)
        }
      }
    })
  }

  checkConditions = (permission, statusCode) => {
    let { ruleConditions } = this.state;
    let result = true;
    if (ruleConditions) {
      ruleConditions.forEach((item, index) => {
        const { paramType, operator, paramName, paramValue } = item;
        if (!paramType || !operator || !paramValue) {
          message.destroy();
          message.error(`Line ${index + 1} condition is incomplete`);
          result = false;
        }
        if (paramType === "uri" || paramType === "host" || paramType === "ip") {
          // aaa
        } else {
          // eslint-disable-next-line no-lonely-if
          if (!paramName) {
            message.destroy();
            message.error(`Line ${index + 1} condition is incomplete`);
            result = false;
          }
        }
      });
    } else {
      message.destroy();
      message.error(`Incomplete condition`);
      result = false;
    }

    if (permission === "reject" && !statusCode) {
      message.destroy();
      message.error(`Please input the status code`);
      result = false;
    }

    return result;
  };

  handleSubmit = e => {
    debugger
    e.preventDefault();
    const { form, handleOk } = this.props;
    const {
      ruleConditions,
      callBackUri
    } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      const {
        name,
        matchMode,
        permission,
        statusCode,
        loged,
        enabled
      } = values;

      const handle = this.getData(values);

      // const handle = {
      //   permission,
      //   statusCode,
      //   callBackUri
      // };
      
      if (!err) {
        const submit = this.checkConditions(permission, statusCode);
        if (submit) {
          handleOk({
            name,
            matchMode,
            // handle: JSON.stringify(handle),
            handle: handle,
            loged,
            enabled,
            sort: Number(values.sort),
            ruleConditions
          });
        }
      }
    });
  };

  handleAdd = () => {
    let { ruleConditions } = this.state;
    ruleConditions.push({
      paramType: "uri",
      operator: "=",
      paramName: "/",
      paramValue: ""
    });
    this.setState({ ruleConditions }, () => {
      let len = ruleConditions.length || 0;
      let key = `paramTypeValueEn${len - 1}`;
      this.setState({ [key]: true });
    });
  };

  handleDelete = index => {
    let { ruleConditions } = this.state;
    if (ruleConditions && ruleConditions.length > 1) {
      ruleConditions.splice(index, 1);
    } else {
      message.destroy();
      message.error("At least one condition");
    }
    this.setState({ ruleConditions });
  };

  conditionChange = (index, name, value) => {
    let { ruleConditions } = this.state;
    ruleConditions[index][name] = value;
    if (name === "paramType") {
      let key = `paramTypeValueEn${index}`;
      if (value === "uri" || value === "host" || value === "ip") {
        this.setState({ [key]: true });
        ruleConditions[index].paramName = "";
      } else {
        this.setState({ [key]: false });
      }
    }

    this.setState({ ruleConditions });
  };

  onHandleChange = (key, value) => {
    this.setState({ [key]: value });
  };

  onHandleNumberChange = (key, value) => {
    if (/^\d*$/.test(value)) {
      this.setState({ [key]: value });
    }
  };

  render() {
    let {
      onCancel,
      form,
      platform,
      name = "",
      matchMode = "",
      loged = true,
      enabled = true,
      sort = ""
    } = this.props;
    const {
      ruleConditions,
      callBackUri,
      headerOperateType,
      parameterOperateType,
      cookieOperateType,
      currentType
    } = this.state;
    const labelWidth = 175

    let { matchModeEnums, operatorEnums, paramTypeEnums} = platform;

    if (operatorEnums) {
      operatorEnums = operatorEnums.filter(item => {
        return item.support === true;
      });
    }

    if (paramTypeEnums) {
      paramTypeEnums = paramTypeEnums.filter(item => {
        return item.support === true;
      });
    }

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        sm: { span: 3 }
      },
      wrapperCol: {
        sm: { span: 21 }
      }
    };
    const formCheckLayout = {
      labelCol: {
        sm: { span: 18 }
      },
      wrapperCol: {
        sm: { span: 4 }
      }
    };
    return (
      <Modal
        width={900}
        centered
        title={getIntlContent("SOUL.RULE.NAME")}
        visible
        okText={getIntlContent("SOUL.COMMON.SURE")}
        cancelText={getIntlContent("SOUL.COMMON.CALCEL")}
        onOk={this.handleSubmit}
        onCancel={onCancel}
      >
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem label={getIntlContent("SOUL.PLUGIN.SELECTOR.LIST.COLUMN.NAME")} {...formItemLayout}>
            {getFieldDecorator("name", {
              rules: [{ required: true, message: getIntlContent("SOUL.COMMON.INPUTNAME") }],
              initialValue: name
            })(<Input placeholder={getIntlContent("SOUL.PLUGIN.SELECTOR.LIST.COLUMN.NAME")} />)}
          </FormItem>
          <FormItem label={getIntlContent("SOUL.COMMON.MATCHTYPE")} {...formItemLayout}>
            {getFieldDecorator("matchMode", {
              rules: [{ required: true, message: getIntlContent("SOUL.COMMON.INPUTMATCHTYPE") }],
              initialValue: matchMode
            })(
              <Select>
                {matchModeEnums.map(item => {
                  return (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <div className={styles.ruleConditions}>
            <h3 className={styles.header} style={{width:105}}>
              <strong>*</strong>
              {getIntlContent("SOUL.COMMON.CONDITION")}:
            </h3>
            <div className={styles.content}>
              {ruleConditions.map((item, index) => {
                return (
                  <ul key={index}>
                    <li>
                      <Select
                        onChange={value => {
                          this.conditionChange(index, "paramType", value);
                        }}
                        value={item.paramType}
                        style={{ width: 90 }}
                      >
                        {paramTypeEnums.map(type => {
                          return (
                            <Option key={type.name} value={type.name}>
                              {type.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </li>
                    <li style={{display: this.state[`paramTypeValueEn${index}`]?'none':'block'}}>
                      <Input
                        onChange={e => {
                          this.conditionChange(
                            index,
                            "paramName",
                            e.target.value
                          );
                        }}
                        value={item.paramName}
                        style={{ width: 100 }}
                      />
                    </li>
                    <li>
                      <Select
                        onChange={value => {
                          this.conditionChange(index, "operator", value);
                        }}
                        value={item.operator}
                        style={{ width: 80 }}
                      >
                        {operatorEnums.map(opearte => {
                          return (
                            <Option key={opearte.name} value={opearte.name}>
                              {opearte.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </li>

                    <li>
                      <Input
                        onChange={e => {
                          this.conditionChange(
                            index,
                            "paramValue",
                            e.target.value
                          );
                        }}
                        value={item.paramValue}
                        style={{ width: 280 }}
                      />
                    </li>
                    <li>
                      <Button
                        type="danger"
                        onClick={() => {
                          this.handleDelete(index);
                        }}
                      >
                        {getIntlContent("SOUL.COMMON.DELETE.NAME")}
                      </Button>
                    </li>
                  </ul>
                );
              })}
            </div>
            <div>
              <Button onClick={this.handleAdd} type="primary">
                {getIntlContent("SOUL.COMMON.ADD")}
              </Button>
            </div>
          </div>

          <div className={styles.handleWrap}>
            <div className={styles.header}>
              <h3>{getIntlContent("SOUL.COMMON.DEAL")}: </h3>
            </div>
            <Tabs style={{ marginLeft: 10 }} defaultActiveKey={currentType} onChange={this.handleTabChange}>
            <TabPane tab="Params" key="parameter">
            {this.state.parameterList && this.state.parameterList.length > 0 && (
              this.state.parameterList.map((row, rowIndex) => {
                return (
                  <Row gutter={24} key={rowIndex}>
                    {
                      row.map((field, i) => {
                        let rules = [];
                        let placeholder = field.fieldLabel;
                        return (
                          <Col span={6} key={i}>
                            {
                              field.fieldName.includes("type") ? (
                                <FormItem>
                                  {getFieldDecorator(field.fieldName, {
                                    rules,
                                    initialValue: field.fieldValue,
                                  })(
                                    <Select onChange={(val) => { this.handleTypeChange(val, "parameter", rowIndex) }} placeholder={placeholder} style={{ width: 200 }}>
                                      {
                                        parameterOperateType.map(opt => {
                                          return <Option value={opt.value}>{opt.label}</Option>
                                        })
                                      }
                                    </Select>
                                  )
                                  }
                                </FormItem>
                              ) : (
                                <FormItem>
                                  {getFieldDecorator(field.fieldName, {
                                    rules,
                                    initialValue: field.fieldValue,
                                  })(
                                    <Input
                                      // addonBefore={<div style={{width: labelWidth}}>{item.label}</div>}
                                      placeholder={placeholder}
                                      key={field.fieldName}
                                    // type="number"
                                    />)
                                  }
                                </FormItem>
                              )
                            }

                          </Col>
                        )
                      })
                    }
                    <Col span={6}>
                      <Button
                        type="danger"
                        style={{ marginRight: "20px" }}
                        onClick={() => {
                          this.handleDeleteRow("parameter", rowIndex);
                        }}
                      >
                        {getIntlContent("SOUL.COMMON.DELETE.NAME")}
                      </Button>
                      {rowIndex === 0 && (
                        <Button onClick={() => this.handleAddRow("parameter")} type="primary">
                          {getIntlContent("SOUL.COMMON.ADD")}
                        </Button>
                      )}
                    </Col>
                  </Row>
                )
              })
            )}
          </TabPane>
          <TabPane tab="Headers" key="header">
            {this.state.headerList && this.state.headerList.length > 0 && (
              this.state.headerList.map((row, rowIndex) => {
                return (
                  <Row gutter={24} key={rowIndex}>
                    {
                      row.map((field, i) => {
                        let rules = [];
                        let placeholder = field.fieldLabel;
                        return (
                          <Col span={6} key={i}>
                            {
                              field.fieldName.includes("type") ? (
                                <FormItem>
                                  {getFieldDecorator(field.fieldName, {
                                    rules,
                                    initialValue: field.fieldValue,
                                  })(
                                    <Select onChange={(val) => { this.handleTypeChange(val, "header", rowIndex) }} placeholder={placeholder} style={{ width: 200 }}>
                                      {
                                        headerOperateType.map(opt => {
                                          return <Option value={opt.value}>{opt.label}</Option>
                                        })
                                      }
                                    </Select>
                                  )
                                  }
                                </FormItem>
                              ) : (
                                <FormItem>
                                  {getFieldDecorator(field.fieldName, {
                                    rules,
                                    initialValue: field.fieldValue,
                                  })(
                                    <Input
                                      // addonBefore={<div style={{width: labelWidth}}>{item.label}</div>}
                                      placeholder={placeholder}
                                      key={field.fieldName}
                                    // type="number"
                                    />)
                                  }
                                </FormItem>
                              )
                            }

                          </Col>
                        )
                      })
                    }
                    <Col span={6}>
                      <Button
                        type="danger"
                        style={{ marginRight: "20px" }}
                        onClick={() => {
                          this.handleDeleteRow("header", rowIndex);
                        }}
                      >
                        {getIntlContent("SOUL.COMMON.DELETE.NAME")}
                      </Button>
                      {rowIndex === 0 && (
                        <Button onClick={() => this.handleAddRow("header")} type="primary">
                          {getIntlContent("SOUL.COMMON.ADD")}
                        </Button>
                      )}
                    </Col>
                  </Row>
                )
              })
            )}
          </TabPane>
          <TabPane tab="Cookies" key="cookie">
            {this.state.cookieList && this.state.cookieList.length > 0 && (
              this.state.cookieList.map((row, rowIndex) => {
                return (
                  <Row gutter={24} key={rowIndex}>
                    {
                      row.map((field, i) => {
                        let rules = [];
                        let placeholder = field.fieldLabel;
                        return (
                          <Col span={6} key={i}>
                            {
                              field.fieldName.includes("type") ? (
                                <FormItem>
                                  {getFieldDecorator(field.fieldName, {
                                    rules,
                                    initialValue: field.fieldValue,
                                  })(
                                    <Select onChange={(val) => { this.handleTypeChange(val, "cookie", rowIndex) }} placeholder={placeholder} style={{ width: 200 }}>
                                      {
                                        cookieOperateType.map(opt => {
                                          return <Option value={opt.value}>{opt.label}</Option>
                                        })
                                      }
                                    </Select>
                                  )
                                  }
                                </FormItem>
                              ) : (
                                <FormItem>
                                  {getFieldDecorator(field.fieldName, {
                                    rules,
                                    initialValue: field.fieldValue,
                                  })(
                                    <Input
                                      // addonBefore={<div style={{width: labelWidth}}>{item.label}</div>}
                                      placeholder={placeholder}
                                      key={field.fieldName}
                                    // type="number"
                                    />)
                                  }
                                </FormItem>
                              )
                            }

                          </Col>
                        )
                      })
                    }
                    <Col span={6}>
                      <Button
                        type="danger"
                        style={{ marginRight: "20px" }}
                        onClick={() => {
                          this.handleDeleteRow("cookie", rowIndex);
                        }}
                      >
                        {getIntlContent("SOUL.COMMON.DELETE.NAME")}
                      </Button>
                      {rowIndex === 0 && (
                        <Button onClick={() => this.handleAddRow("cookie")} type="primary">
                          {getIntlContent("SOUL.COMMON.ADD")}
                        </Button>
                      )}
                    </Col>
                  </Row>
                )
              })
            )}
          </TabPane>
            </Tabs>

          </div>

          {/* <FormItem label="状态码" {...formItemLayout}>
            {getFieldDecorator("statusCode", {
              initialValue: statusCode,
              rules: [
                {
                  pattern: /^\d*$/,
                  message: "请输入数字"
                }
              ]
            })(<Input placeholder="请输入状态码" />)}
          </FormItem> */}
          <div className={styles.layout}>
            <FormItem
              style={{ margin: "0 20px" }}
              {...formCheckLayout}
              label={getIntlContent("SOUL.SELECTOR.PRINTLOG")}
            >
              {getFieldDecorator("loged", {
                initialValue: loged,
                valuePropName: "checked",
                rules: [{ required: true }]
              })(<Switch />)}
            </FormItem>
            <FormItem {...formCheckLayout} label={getIntlContent("SOUL.SELECTOR.WHETHEROPEN")}>
              {getFieldDecorator("enabled", {
                initialValue: enabled,
                valuePropName: "checked",
                rules: [{ required: true }]
              })(<Switch />)}
            </FormItem>
          </div>

          <FormItem label={getIntlContent("SOUL.SELECTOR.EXEORDER")} {...formItemLayout}>
            {getFieldDecorator("sort", {
              initialValue: sort,
              rules: [
                {
                  required: true,
                  message: getIntlContent("SOUL.SELECTOR.INPUTNUMBER")
                },
                {
                  pattern: /^([1-9][0-9]{0,1}|100)$/,
                  message: getIntlContent("SOUL.SELECTOR.INPUTNUMBER")
                }
              ]
            })(<Input placeholder={getIntlContent("SOUL.SELECTOR.INPUTORDER")} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(AddModal);
