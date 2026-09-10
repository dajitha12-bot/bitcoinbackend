import React from 'react';
import '../styles/data-table.css';

export const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = 'No records found',
}) => {
  return (
    <div className="rf-data-table-wrapper">

      <div className="rf-data-table-scroll">

        <table className="rf-data-table">

          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={column.accessor || column.id || index}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row?.id || row?._id || rowIndex}>

                  {columns.map((column, columnIndex) => (
                    <td
                      key={
                        column.accessor ||
                        column.id ||
                        columnIndex
                      }
                    >
                      {column.cell
                        ? column.cell(row)
                        : row?.[column.accessor] ?? '—'}
                    </td>
                  ))}

                </tr>
              ))
            ) : (
              <tr className="rf-data-table-empty-row">
                <td colSpan={columns.length || 1}>
                  <div className="rf-data-table-empty">
                    <span className="rf-data-table-empty-line"></span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
};

export default DataTable;