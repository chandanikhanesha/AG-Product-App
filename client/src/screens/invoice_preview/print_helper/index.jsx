import { useEffect } from 'react';
import CheckBox from '@material-ui/core/Checkbox';

import './styles.css';

const DEFAULT_BREAK_CLASS = 'default-break';
const TABLE_BREAK_CLASS = 'table-break';

const buttonString = `
<span>
  +
</span>
`;

const PrintHelper = (props) => {
  let px_per_cm = 0; // 37.795 on most screens

  /**
   * Creates and returns a default (natural) break element
   * @param {number} top Top to apply to element style
   */
  const defaultBreak = (top) => {
    let $defaultBreakEl = document.createElement('div');
    $defaultBreakEl.classList.add(DEFAULT_BREAK_CLASS);
    $defaultBreakEl.style.top = top;
    return $defaultBreakEl;
  };

  /**
   * Gets the top position of a dom element
   * @param {HTMLElement} $el
   */
  const getOffsetTop = ($el) => {
    const scrollTop = window.pageYOffset;
    const rect = $el.getBoundingClientRect();
    return rect.top + scrollTop;
  };
  function removeElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }
  /**
   * Inserts the natural page breaks
   */
  const insertDefaultBreaks = () => {
    removeElementsByClass(`${DEFAULT_BREAK_CLASS}`);

    // 29.7 - A4
    // let heightInCm = 29.9 // A4 adjusted
    // 27.94 - Letter
    let heightInCm = 28.0; // Letter adjusted
    let heightInPx = heightInCm * px_per_cm;
    const $printContainer = document.getElementById('invoice');
    if (!$printContainer) return;
    let containerHeight = $printContainer.clientHeight;
    const $invoiceNote = document.getElementById('invoice-note');
    if ($invoiceNote.textContent === '') {
      containerHeight = containerHeight - $invoiceNote.clientHeight;
    }

    let topInCm = heightInCm;
    let topInPx = topInCm * px_per_cm;

    while (topInPx < containerHeight) {
      let $tableBreaks = document.getElementsByClassName(`${TABLE_BREAK_CLASS}`);
      let $breakBeforeTop = Array.from($tableBreaks).reduce((acc, $break) => {
        if (acc) return acc;
        if (getOffsetTop($break) < topInPx && getOffsetTop($break) - 1 >= topInPx - heightInPx) return $break;
      }, null);

      if ($breakBeforeTop) {
        topInCm = getOffsetTop($breakBeforeTop) / px_per_cm + heightInCm;
        topInPx = topInCm * px_per_cm;
      } else {
        $printContainer.append(defaultBreak(`${topInCm}cm`));
        topInCm += heightInCm;
        topInPx = topInCm * px_per_cm;
      }
    }
  };

  /**
   * Inserts table break buttons at a table
   * @param {HTMLElement} $table
   */
  const insertTableBreakButton = ($table) => {
    let $el = document.createElement('div');
    $el.classList.add('table-line-break-helper');
    if (!($table.id == 'summary-check' || $table.id == 'breakDown-check' || $table.id == 'companys-check')) {
      $el.classList.add('marginTop');
      $el.classList.add('rightAlignIcon');
    } else {
      $el.classList.add('rightAlignIcon');
    }

    // console.log($table.id, '$table');

    // if ($table.id == 'summary-check' || $table.id == 'breakDown-check' || $table.id == 'companys-check') {
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = $table.id;
    checkbox.value = true;
    checkbox.defaultChecked = true;
    checkbox.id = `${$table.id}Box`;
    checkbox.style = 'accent-color: #38a154;height: 15px;width: 19px;margin-left:-15px;';

    const element = document.getElementById(`${$table.id}Box`);

    if (element && props.showHideCheckBox == false) {
      removeElementsByClass('table-line-break-helper');
    } else if (props.showHideCheckBox) {
      $el.classList.remove('rightAlignIcon');

      $el.appendChild(checkbox);

      $el.onclick = (e) => {
        const isCheck = e.target.checked;
        // $el.classList.remove('marginTop');

        if ($table.id.split('-')[0] == 'summary-Section'.split('-')[0]) {
          if (isCheck == false) {
            document.getElementById('summary-Section').style.display = 'none';
            document.getElementById('summary-check').style.background = '#e3e3e3';
            document.getElementById('summary-border').style.borderStyle = 'dashed';
          } else {
            document.getElementById('summary-Section').style.display = 'contents';
            document.getElementById('summary-check').style.background = '#9e9e9e8f';
            document.getElementById('summary-border').style.borderStyle = 'solid';
          }
        } else if ($table.id.split('-')[0] == 'breakDown-Section'.split('-')[0]) {
          if (isCheck == false) {
            document.getElementById('breakDown-Section').style.display = 'none';
            document.getElementById('breakDown-check').style.background = '#e3e3e3';
            document.getElementById('breakDown-border').style.borderStyle = 'dashed';
          } else {
            document.getElementById('breakDown-Section').style.display = 'contents';
            document.getElementById('breakDown-check').style.background = '#9e9e9e8f';
            document.getElementById('breakDown-border').style.borderStyle = 'solid';
          }
        } else if ($table.id.split('-')[0] == 'companys-Section'.split('-')[0]) {
          if (isCheck == false) {
            document.getElementById('companys-Section').style.display = 'none';
            document.getElementById('companys-check').style.background = '#e3e3e3';
            document.getElementById('companys-border').style.borderStyle = 'dashed';
          } else {
            document.getElementById('companys-Section').style.display = 'contents';
            document.getElementById('companys-check').style.background = '#9e9e9e8f';
            document.getElementById('companys-border').style.borderStyle = 'solid';
          }
        } else {
          const id = document.getElementById($table.id);
          if (isCheck == false) {
            document.getElementById(`${$table.id}/text`).style.display = 'none';
            document.getElementById(`${$table.id}/border`).style.borderBottom = 'none';
            id.querySelectorAll('.rt-table')[0].style.display = 'none';
          } else {
            document.getElementById(`${$table.id}/text`).style.display = 'contents';
            id.querySelectorAll('.rt-table')[0].style.display = 'contents';
            document.getElementById(`${$table.id}/border`).style.borderBottom = '2px solid #80808096';
          }
        }
      };
    }

    if (props.showHideCheckBox == false) {
      $el.innerHTML = buttonString.trim();
      $el.onclick = () => {
        let $break = document.createElement('div');
        $break.classList.add(TABLE_BREAK_CLASS);
        const $wrapper = $table.closest('.invoice-table-wrapper');
        if (!$wrapper) {
          return console.error('did not find table wrapper for page break');
        }
        if ($wrapper.querySelector(`.${TABLE_BREAK_CLASS}`)) return;
        $wrapper.prepend($break);
        insertDefaultBreaks();
      };
    }
    // } else {
    //   $el.innerHTML = buttonString.trim();
    //   $el.onclick = () => {
    //     let $break = document.createElement('div');
    //     $break.classList.add(TABLE_BREAK_CLASS);
    //     const $wrapper = $table.closest('.invoice-table-wrapper');
    //     if (!$wrapper) {
    //       return console.error('did not find table wrapper for page break');
    //     }
    //     if ($wrapper.querySelector(`.${TABLE_BREAK_CLASS}`)) return;
    //     $wrapper.prepend($break);
    //     insertDefaultBreaks();
    //   };
    // }

    return $el;
  };

  /**
   * Computes the px per cm for the users screen, sets the `px_per_cm` global variable
   */
  const computePxPerCm = () => {
    let $d = document.createElement('div');
    $d.style.position = 'absolute';
    $d.style.top = '-1000cm';
    $d.style.left = '-1000cm';
    $d.style.height = '1000cm';
    $d.style.width = '1000cm';
    document.body.append($d);
    px_per_cm = $d.clientHeight / 1000;
    $d.remove();
  };

  /**
   * Insert a break at a specific table row ('.tr-tr-group' selector)
   * @param {HTMLElement} $el Table row to break before
   */
  const breakAtTrGroup = ($el) => {
    $el.classList.remove('invoice-print-highlight');

    // get the parent table, cache all table rows, passed row index and clone the table
    let $table = $el.closest('.ReactTable');
    let $rows = $table.querySelectorAll('.rt-tr-group');
    let rowIdx = Array.from($rows).indexOf($el);
    let $tableClone = $table.cloneNode(true);

    // Remove the row and any rows after from the table
    $rows.forEach(($row, idx) => {
      if (idx >= rowIdx) $row.remove();
    });

    // Remove any rows before the passed row from the cloned table
    $tableClone.querySelectorAll('.rt-tr-group').forEach(($row, idx) => {
      if (idx < rowIdx) $row.remove();
    });

    // Insert a wrapper and the cloned table
    let $wrapper = document.createElement('div');
    $wrapper.classList.add('invoice-table-wrapper');
    let $break = document.createElement('div');
    $break.classList.add(TABLE_BREAK_CLASS);
    $wrapper.append($break);
    $wrapper.append($tableClone);
    $wrapper.style.marginBottom = '10px';
    $table.closest('.invoice-table-wrapper') && $table.closest('.invoice-table-wrapper').after($wrapper);
    $wrapper.querySelectorAll('.rt-tr-group').forEach(($el) => {
      $el.addEventListener('mouseover', () => {
        $el.classList.add('invoice-print-highlight');
      });
      $el.addEventListener('mouseout', () => {
        $el.classList.remove('invoice-print-highlight');
      });
      $el.addEventListener('click', () => {
        breakAtTrGroup($el);
      });
    });
    insertDefaultBreaks();
  };

  /**
   * Setup method to get things started
   */
  const setup = () => {
    computePxPerCm();

    const $tables = document.querySelectorAll('.ReactTable');

    $tables.forEach(($table) => {
      $table.appendChild(insertTableBreakButton($table));
    });

    const $trGroups = document.querySelectorAll('.rt-tr-group');
    $trGroups.forEach(($el) => {
      $el.addEventListener('mouseover', () => {
        $el.classList.add('invoice-print-highlight');
      });
      $el.addEventListener('mouseout', () => {
        $el.classList.remove('invoice-print-highlight');
      });
      $el.addEventListener('click', () => {
        breakAtTrGroup($el);
      });
    });

    insertDefaultBreaks();
  };

  useEffect(() => {
    setTimeout(() => {
      setup();
    }, 1000);
  }, []);

  return null;
};

export default PrintHelper;
