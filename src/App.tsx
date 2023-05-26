import React, { useState } from 'react';
import Papa from 'papaparse';
import './App.css';
import { AiFillEdit } from 'react-icons/ai'
import { Modal } from 'antd';

function App() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [header, setHeader] = useState<string[]>([]);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [switchState, setSwitchState] = useState<boolean[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalRowIndex, setModalRowIndex] = useState<number>(0);
  const [modalCellIndex, setModalCellIndex] = useState<number>(0);
  const [modalInputValue, setModalInputValue] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const csvText = reader.result as string;
        Papa.parse(csvText, {
          complete: (results) => {
            const switchStateArray = Array.from(
              { length: results.data.length - 1 },
              () => false
            );
            setHeader(results.data[0] as string[]);
            setCsvData(
              results.data.slice(1).map((row: any, rowIndex: number) => {
                if (row.includes("comment")) {
                  return [...row, switchStateArray[rowIndex]];
                } else {
                  return row;
                }
              })
            );
            setEditedData(results.data.slice(1).map((row: any, rowIndex: number) => {
              if (row.includes("comment")) {
                return [...row, switchStateArray[rowIndex]];
              } else {
                return row;
              }
            }));
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSwitchChange = (rowIndex: number) => {
    const updatedSwitchState = [...switchState];
    updatedSwitchState[rowIndex] = !updatedSwitchState[rowIndex];
    setSwitchState(updatedSwitchState);

    const updatedEditedData = [...editedData];
    const commentIndex = updatedEditedData[rowIndex].findIndex((cell: any) => cell.includes("comment")) + 1;
    if (commentIndex !== -1) {
      const comment = updatedEditedData[rowIndex][commentIndex];
      if (updatedSwitchState[rowIndex]) {
        updatedEditedData[rowIndex][commentIndex] = `${comment} [ADD]`;
      } else {
        updatedEditedData[rowIndex][commentIndex] = comment.replace(" [ADD]", "");
      }
      setEditedData(updatedEditedData);
    }
  };


  const handleCellEdit = (
    newValue: string,
    rowIndex: number,
    cellIndex: number
  ) => {
    const updatedData = [...editedData];
    updatedData[rowIndex][cellIndex] = newValue;
    setEditedData(updatedData);
  };

  const handleModalOpen = (rowIndex: number, cellIndex: number) => {
    const cellValue = editedData[rowIndex][cellIndex];
    setModalInputValue(cellValue);
    setModalRowIndex(rowIndex);
    setModalCellIndex(cellIndex);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSave = (newValue: string) => {
    const updatedData = [...editedData];
    updatedData[modalRowIndex][modalCellIndex] = newValue;
    setEditedData(updatedData);
    setModalVisible(false);
  };
  return (
    <div className="container">
      <div className="main">
        <div className='header-action'>
          <div className='frame-input-file'>
            <input className='open-file' id='select-file' type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        </div>
        {Array.isArray(header) && header.length > 0 &&
          <div className='frame-header-row' style={{ gridTemplateColumns: `repeat(${header.length + 1}, minmax(0, 1fr))` }}>
            {header.map((cell: any, cellIndex: any) => (
              <div className='item-header-row' key={cellIndex}>
                <button className='button'>
                  {cell.charAt(0).toUpperCase() + cell.slice(1)}
                </button>
              </div>
            ))}
            <div className='item-header-row'>
              Add comment
            </div>
          </div>
        }
        {Array.isArray(header) && header.length > 0 &&
          <div className='frame-header-row' style={{ gridTemplateColumns: `repeat(${header.length}, minmax(0, 1fr))` }}>
            {header.slice(1).map((cell: any, cellIndex: any) => (
              <div className='item-header-row' key={cellIndex}>
                <button className='button'>
                  {cell.charAt(0).toUpperCase() + cell.slice(1)}
                </button>
              </div>
            ))}
            <div className='item-header-row'>
              Add comment
            </div>
          </div>
        }
        <table className='frame-table'>
          <tbody className='tbody'>
            {Array.isArray(editedData) && editedData.length > 1
              &&
              editedData.map((row: any[], rowIndex: any) => (
                <tr key={rowIndex} className='item-content-row'
                  style={{
                    gridTemplateColumns: `repeat(${header.length}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(2, 1fr)`,
                    gap: '1rem'
                  }}>
                  {
                    row.map((cell: any, cellIndex: any) => {
                      if (cellIndex === row.length - 1 && row.includes('comment')) {
                        return (
                          cellIndex === 0
                            ? <div className='title'
                              style={{
                                gridRow: '1',
                                gridColumn: `span ${header.length} / span ${header.length}`
                              }}>{cell}</div>
                            : <td style={{ gridRow: '2' }} key={`${rowIndex}-${cellIndex}`} className='item-content input'>
                              <input
                                type="checkbox" checked={switchState[rowIndex]} onChange={() => handleSwitchChange(rowIndex)}
                              />
                            </td>
                        );
                      } else {
                        return (
                          cellIndex === 0
                            ? <div className='title'
                              style={{
                                gridRow: '1',
                                gridColumn: `span ${header.length} / span ${header.length}`
                              }}>{cell}</div>
                            : <td style={{
                              gridRow: '2',
                              backgroundColor: rowIndex % 2 === 0 ? '#161616' : '#363535',
                            }} key={`${rowIndex}-${cellIndex}`} className='item-content'>
                              <input
                                style={{
                                  backgroundColor: rowIndex % 2 === 0 ? '#161616' : '#363535'
                                }}
                                type="text"
                                value={editedData[rowIndex][cellIndex]}
                                onChange={(event) => handleCellEdit(event.target.value, rowIndex, cellIndex)}
                              />
                              <button className='button-edit-field' onClick={() => handleModalOpen(rowIndex, cellIndex)}>
                                <AiFillEdit />
                              </button>
                            </td>
                        );
                      }
                    })
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <Modal
        visible={modalVisible}
        onCancel={handleModalClose}
        onOk={() => handleModalSave(modalInputValue)}
        className='edit-modal'
      >
        <label>
          Edit data
        </label>
        <textarea
          key='textarea-field'
          value={modalInputValue}
          onChange={(event) => setModalInputValue(event.target.value)}
          rows={20}
        />
      </Modal>
    </div>
  );
}

export default App;
