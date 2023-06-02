import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import tableStyle from '../../../assets/jss/material-dashboard-pro-react/components/tableStyle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';

function CustomTable({ ...props }) {
  const {
    classes,
    tableHead,
    tableData,
    tableHeaderColor,
    hover,
    colorsColls,
    coloredColls,
    customCellClasses,
    customClassesForCells,
    striped,
    tableShopping,
    customHeadCellClasses,
    customHeadClassesForCells,
    selectable,
    checkIsSelected,
    handleClick,
    handleSelectAll,
    numSelected,
    rowCount,
    selectedZones = () => {},
    flag,
    edit,
    isCheckBox,
  } = props;
  const [selectedZoneObj, setSelectedZoneObj] = useState({});
  const [notCheckItemsArray, setNotCheckItemsArray] = useState([]);
  let checkboxcounter = -1;

  const handleCheckBox = (e) => {
    if (e.target.checked) {
      const lineNumberOfAction = e.target.name.slice(5);
      const Updated = notCheckItemsArray.filter((item) => item != lineNumberOfAction);
      setNotCheckItemsArray([...Updated]);
    } else {
      const lineNumberOfAction = e.target.name.slice(5);
      setNotCheckItemsArray([...notCheckItemsArray, lineNumberOfAction]);
    }
  };

  const handleSelectChange = (e) => {
    const lineNumberOfSelectAction = e.target.name.slice(6);
    const value = e.target.value;
    const obj = {};
    obj[`${lineNumberOfSelectAction}`] = value;
    if (selectedZoneObj[lineNumberOfSelectAction]) {
      setSelectedZoneObj({ ...selectedZoneObj, ...obj });
    }
  };
  useEffect(() => {
    const { flag, customerZonesAndCrop, edit, licences, notIncludeList } = props;
    if (flag) {
      customerZonesAndCrop(notCheckItemsArray, notIncludeList, licences);
    } else if (edit) {
      const fakezone = [{ classification: '', zoneId: '' }];
      if (licences !== fakezone) {
        customerZonesAndCrop(notCheckItemsArray, notIncludeList, licences);
      }
    } else {
      selectedZones(notCheckItemsArray);
    }
  }, [notCheckItemsArray, selectedZoneObj]);
  return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined ? (
          <TableHead className={classes[tableHeaderColor]}>
            <TableRow className={classes.tableRow}>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={numSelected === rowCount}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {tableHead.map((prop, key) => {
                const tableCellClasses =
                  classes.tableHeadCell +
                  ' ' +
                  classes.tableCell +
                  ' ' +
                  cx({
                    [customHeadCellClasses[customHeadClassesForCells.indexOf(key)]]:
                      customHeadClassesForCells.indexOf(key) !== -1,
                    [classes.tableShoppingHead]: tableShopping,
                    [classes.tableHeadFontSize]: !tableShopping,
                  });
                return (
                  <TableCell className={tableCellClasses} key={key}>
                    {prop}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
        ) : null}
        <TableBody>
          {tableData.map((prop, key) => {
            checkboxcounter += 1;
            var rowColor = '';
            var rowColored = false;
            if (prop.color !== undefined) {
              rowColor = prop.color;
              rowColored = true;
              prop = prop.data;
            }
            const tableRowClasses = cx({
              [classes.tableRowHover]: hover,
              [classes[rowColor + 'Row']]: rowColored,
              [classes.tableStripedRow]: striped && key % 2 === 0,
            });
            const backgroundColor = key % 2 === 0 ? 'white' : 'rgba(0, 0, 0, 0.03)';
            if (prop.total) {
              return (
                <TableRow key={key} hover={hover} className={tableRowClasses}>
                  <TableCell className={classes.tableCell} colSpan={prop.colspan} />
                  <TableCell className={classes.tableCell + ' ' + classes.tableCellTotal}>Total</TableCell>
                  <TableCell className={classes.tableCell + ' ' + classes.tableCellAmount}>{prop.amount}</TableCell>
                  {tableHead.length - (prop.colspan - 0 + 2) > 0 ? (
                    <TableCell className={classes.tableCell} colSpan={tableHead.length - (prop.colspan - 0 + 2)} />
                  ) : null}
                </TableRow>
              );
            }
            if (prop.purchase) {
              return (
                <TableRow key={key} hover={hover} className={tableRowClasses}>
                  <TableCell className={classes.tableCell} colSpan={prop.colspan} />
                  <TableCell className={classes.tableCell + ' ' + classes.right} colSpan={prop.col.colspan}>
                    {prop.col.text}
                  </TableCell>
                </TableRow>
              );
            }
            if (prop.id && selectable && tableHead !== undefined) {
              const isSelected = checkIsSelected(prop.id);
              return (
                <TableRow
                  key={prop.id}
                  hover={hover}
                  className={classes.tableRow + ' ' + tableRowClasses}
                  role="checkbox"
                  selected={isSelected}
                  aria-checked={isSelected}
                  tabIndex={-1}
                >
                  <TableCell padding="checkbox" key={prop.id}>
                    <Checkbox checked={isSelected} onChange={() => handleClick(prop.id)} />
                  </TableCell>
                  {Object.keys(prop)
                    .slice(1)
                    .map((value, key) => {
                      const tableCellClasses =
                        classes.tableCell +
                        ' ' +
                        cx({
                          [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                          [customCellClasses[customClassesForCells.indexOf(key)]]:
                            customClassesForCells.indexOf(key) !== -1,
                        });

                      return (
                        <TableCell className={tableCellClasses} key={key}>
                          {prop[value]}
                        </TableCell>
                      );
                    })}
                </TableRow>
              );
            }
            if (flag || edit) {
              return (
                <TableRow
                  key={key}
                  hover={hover}
                  className={classes.tableRow + ' ' + tableRowClasses}
                  style={{ backgroundColor: backgroundColor }}
                >
                  {prop.map((prop, key) => {
                    if (key == 0) {
                      const nameOfCheckbox = `check${checkboxcounter}`;
                      const tableCellClasses =
                        classes.tableCell +
                        ' ' +
                        cx({
                          [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                          [customCellClasses[customClassesForCells.indexOf(key)]]:
                            customClassesForCells.indexOf(key) !== -1,
                        });
                      if (prop.props.inputProps[`aria-label`] === 'disabled checkbox') {
                        return (
                          <Checkbox
                            className={tableCellClasses}
                            name={nameOfCheckbox}
                            disabled
                            color="primary"
                            inputProps={prop.props.inputProps}
                            // onChange={handleCheckBox}
                          />
                        );
                      } else if (prop.props.inputProps[`display`] === 'none') {
                        return (
                          <Checkbox
                            style={{ display: 'none' }}
                            className={tableCellClasses}
                            name={nameOfCheckbox}
                            defaultChecked
                            color="primary"
                            inputProps={prop.props.inputProps}
                            onChange={handleCheckBox}
                          />
                        );
                      } else {
                        return (
                          <Checkbox
                            className={tableCellClasses}
                            name={nameOfCheckbox}
                            defaultChecked
                            color="primary"
                            inputProps={prop.props.inputProps}
                            onChange={handleCheckBox}
                          />
                        );
                      }
                    } else if (key == 2) {
                      if (prop.type === 'span') {
                        const tableCellClasses =
                          classes.tableCell +
                          ' ' +
                          cx({
                            [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                            [customCellClasses[customClassesForCells.indexOf(key)]]:
                              customClassesForCells.indexOf(key) !== -1,
                          });
                        return (
                          <TableCell className={tableCellClasses} key={key}>
                            {prop}
                          </TableCell>
                        );
                      } else {
                        const zonelist = [];
                        prop.props.children.map((item) => {
                          zonelist.push(item.props.children);
                        });

                        const obj = {};
                        obj[`${checkboxcounter}`] = zonelist[0];
                        if (!selectedZoneObj[`${checkboxcounter}`]) {
                          setSelectedZoneObj({
                            ...selectedZoneObj,
                            ...obj,
                          });
                        }
                        const tableCellClasses =
                          classes.tableCell +
                          ' ' +
                          cx({
                            [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                            [customCellClasses[customClassesForCells.indexOf(key)]]:
                              customClassesForCells.indexOf(key) !== -1,
                          });
                        return (
                          <div className={tableCellClasses}>
                            <FormControl variant="outlined" style={{ minWidth: 100 }}>
                              <Select
                                className={tableCellClasses}
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={selectedZoneObj[`${checkboxcounter}`]}
                                onChange={handleSelectChange}
                                name={`select${checkboxcounter}`}
                              >
                                {zonelist.map((item) => (
                                  <MenuItem value={item}>{item}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        );
                      }
                    } else {
                      const tableCellClasses =
                        classes.tableCell +
                        ' ' +
                        cx({
                          [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                          [customCellClasses[customClassesForCells.indexOf(key)]]:
                            customClassesForCells.indexOf(key) !== -1,
                        });
                      return (
                        <TableCell className={tableCellClasses} key={key}>
                          {prop}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              );
            }
            return (
              <TableRow
                key={key}
                hover={hover}
                className={classes.tableRow + ' ' + tableRowClasses}
                style={{ backgroundColor: backgroundColor }}
              >
                {prop.map((prop, key) => {
                  if (isCheckBox === false) {
                    const tableCellClasses =
                      classes.tableCell +
                      ' ' +
                      cx({
                        [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                        [customCellClasses[customClassesForCells.indexOf(key)]]:
                          customClassesForCells.indexOf(key) !== -1,
                      });
                    return (
                      <TableCell className={tableCellClasses} key={key}>
                        {prop}
                      </TableCell>
                    );
                  } else {
                    if (key == 0) {
                      const nameOfCheckbox = `check${checkboxcounter}`;
                      const tableCellClasses =
                        classes.tableCell +
                        ' ' +
                        cx({
                          [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                          [customCellClasses[customClassesForCells.indexOf(key)]]:
                            customClassesForCells.indexOf(key) !== -1,
                        });
                      if (
                        prop &&
                        prop.props !== undefined &&
                        prop.props.inputProps !== undefined &&
                        prop.props.inputProps[`display`] === 'none'
                      ) {
                        return (
                          <Checkbox
                            style={{ display: 'none' }}
                            className={tableCellClasses}
                            name={nameOfCheckbox}
                            defaultChecked
                            color="primary"
                            inputProps={prop.props.inputProps}
                            onChange={handleCheckBox}
                          />
                        );
                      } else {
                        return (
                          <Checkbox
                            className={tableCellClasses}
                            name={nameOfCheckbox}
                            defaultChecked
                            color="primary"
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                            onChange={handleCheckBox}
                          />
                        );
                      }
                    } else {
                      const tableCellClasses =
                        classes.tableCell +
                        ' ' +
                        cx({
                          [classes[colorsColls[coloredColls.indexOf(key)]]]: coloredColls.indexOf(key) !== -1,
                          [customCellClasses[customClassesForCells.indexOf(key)]]:
                            customClassesForCells.indexOf(key) !== -1,
                        });
                      return (
                        <TableCell className={tableCellClasses} key={key}>
                          {prop}
                        </TableCell>
                      );
                    }
                  }
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

CustomTable.defaultProps = {
  tableHeaderColor: 'gray',
  hover: false,
  colorsColls: [],
  coloredColls: [],
  striped: false,
  customCellClasses: [],
  customClassesForCells: [],
  customHeadCellClasses: [],
  customHeadClassesForCells: [],
};

CustomTable.propTypes = {
  classes: PropTypes.object.isRequired,
  tableHeaderColor: PropTypes.oneOf(['warning', 'primary', 'danger', 'success', 'info', 'rose', 'gray']),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  // Of(PropTypes.arrayOf(PropTypes.node)) || Of(PropTypes.object),
  tableData: PropTypes.array,
  hover: PropTypes.bool,
  coloredColls: PropTypes.arrayOf(PropTypes.number),
  // Of(["warning","primary","danger","success","info","rose","gray"]) - colorsColls
  colorsColls: PropTypes.array,
  customCellClasses: PropTypes.arrayOf(PropTypes.string),
  customClassesForCells: PropTypes.arrayOf(PropTypes.number),
  customHeadCellClasses: PropTypes.arrayOf(PropTypes.string),
  customHeadClassesForCells: PropTypes.arrayOf(PropTypes.number),
  selectable: PropTypes.bool,
  checkIsSelected: PropTypes.func,
  handleClick: PropTypes.func,
  handleSelectAll: PropTypes.func,
  striped: PropTypes.bool,
  // this will cause some changes in font
  tableShopping: PropTypes.bool,
};

export default withStyles(tableStyle)(CustomTable);
