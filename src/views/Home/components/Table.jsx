import React, { useState } from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import styles from '../home.module.less';

dayjs.extend(relativeTime)

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'City' },
  { id: 'aqi', numeric: true, disablePadding: false, label: 'AQI' },
  { id: 'change', numeric: true, disablePadding: false, label: 'Change (%)' },
  { id: 'lastUpdated', numeric: false, disablePadding: false, label: 'Last Updated' },
];

const backgroundColor = {
  50: '#54A94F',
  100: '#A3C853',
  200: '#FFF832',
  300: '#F39C32',
  400: '#E93F33',
  500: '#AF2D24'
}

const getBackgroundColor = (value) => {
  for(let limit of _.keys(backgroundColor)){
    if(value < limit) {
      return backgroundColor[limit];
    }
  }
}

const EnhancedTableHead = (props) => {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const CityTable = (props) => {
  const { pollutionData, selected, setSelected } = props;
  const cloneData = _.cloneDeep(pollutionData);
  delete cloneData.messageReceivedAt;
  const rows = _.map(cloneData, (obj, key) => {
    const currentAQI = obj[obj?.length - 1]?.aqi;
    const prevAQI = obj[obj?.length - 2]?.aqi;
    const changeInAQI = ((currentAQI - prevAQI) / currentAQI ) * 100;
    return ({
      name: key,
      aqi: obj[obj?.length - 1]?.aqi,
      change: Math.round(changeInAQI * 100) / 100,
      updatedAt: obj[obj?.length - 1]?.receivedAt
    })
  })
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };


  return (
    <div className={styles.tableContainer}>
      <TableContainer>
          <Table
            className={styles.ctable}
            aria-labelledby="cities-aqi-list"
            size='medium'
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={styles}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const aqi = Math.round(row.aqi * 100) / 100;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                      className={styles.tableRow}
                      style={{ backgroundColor: getBackgroundColor(aqi) }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                          color="default"
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{aqi}</TableCell>
                      <TableCell align="right">{Number.isNaN(row.change) ? '-' : row.change}</TableCell>
                      <TableCell align="right">{dayjs(row.updatedAt).fromNow()}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[{value:5, label: '5'}, {value:10, label: '10'}, {value: rows.length, label: 'All'}]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        <div className={styles.indicator}>
          <div className={styles.box} style={{ backgroundColor: backgroundColor[50]}}></div>
          <span>0-50</span>
          <div className={styles.box} style={{ backgroundColor: backgroundColor[100]}}></div>
          <span>51-100</span>
          <div className={styles.box} style={{ backgroundColor: backgroundColor[200]}}></div>
          <span>101-200</span>
          <div className={styles.box} style={{ backgroundColor: backgroundColor[300]}}></div>
          <span>201-300</span>
          <div className={styles.box} style={{ backgroundColor: backgroundColor[400]}}></div>
          <span>301-400</span>
          <div className={styles.box} style={{ backgroundColor: backgroundColor[500]}}></div>
          <span>401-500</span>
        </div>
    </div>
    
  )
}

export default CityTable;