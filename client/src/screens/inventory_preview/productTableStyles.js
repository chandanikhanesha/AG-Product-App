export default (theme) => ({
  actionBar: {
    marginTop: '-90px',
    float: 'right',
    display: 'inline-flex',
  },
  horizTableMenu: {
    marginRight: 20,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  horizTableMenuItem: {
    borderRadius: '3px',
    margin: '0 8px',
    padding: '12px 24px',
    transition: 'none',
    '&:hover': {
      background: '#38A154',
      color: 'white',
      boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.36)',
    },
  },
  lotIcon: {
    zIndex: 1,
  },
  columnMenu: {
    marginRight: 20,
  },
  columnHeaderOverride: {
    overflow: 'visible',
    whiteSpace: 'normal',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#000000',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#000000',
  },
  columnHeaderGroup: {
    textAlign: 'center',
  },
  onSaveButton: {
    display: 'flex',
    justifyContent: 'center',
    paddingRight: 25,
  },
  lotList: {
    padding: 0,
    margin: 0,
  },
  lotItem: {
    listStyleType: 'none',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  lotItemLabel: {
    marginRight: 8,
    color: '#888',
  },
  lotItemValue: {},
  seasonSelector: {
    minWidth: '120px',
    marginRight: '20px',
  },
  productDeleteBtn: {
    marginRight: 12,
  },
  productTableContainer: {
    marginTop: 32,
  },
  sticky: {
    color: 'red',
  },
  productTable: {
    // "& .hide-print": {
    //   display: "none",
    //   width: "0 !important",
    //   padding: "0 !important",
    //   margin: "0 !important",
    // },

    //sticky
    // "& .rt-tbody": {
    //   overflow: "visible !important"
    // },
    // "& .sticky": {
    //   position: "sticky !important",
    //   left: 0,
    //   top: 0,
    //   zIndex: 1,
    //   "&.sticky-blend": {
    //     left: 110,  //brand min width
    //   },
    //   "&.sticky-rm": {
    //     left: 260, //brand+ blend  min width
    //   }
    // },
    // "& .rt-thead": {
    //   overflowY: "scroll"
    // },

    //end sticky

    '& .rt-thead .rt-th:last-child': {
      textAlign: 'left',
    },
    // "& .rt-thead .rt-th": {
    //   lineHeight: "1.5em !important",
    //   fontWeight: "bold",
    //   color: "#000",
    //   fontSize: 18,
    //   whiteSpace: "normal"
    // },
    // "& .rt-thead .rt-th.-cursor-pointer:first-of-type > div:first-of-type::after": {
    //   display: "none"
    // },

    // "& .rt-td, & .rt-thead .rt-th": {
    //   fontSize: "10px",
    //   flex: "0 0 auto !important",
    //   margin: "15px 10px"
    // },
    // "& .rt-thead .rt-th.-cursor-pointer > div:first-of-type::after": {
    //   display: "none"
    // },
    // "& .rt-thead.-headerGroups .rt-th": {
    //   textAlign: "center",
    //   "&::first-child": {
    //     display: "none"
    //   }
    // }
  },
  cardIcon: {
    color: 'white',
  },
  select: {
    width: '100%',
    marginBottom: '16px',
  },
  root: {
    flexGrow: 1,
    height: 250,
  },
  textField: {
    marginBottom: '16px',
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
  },
  singleValue: {
    // fontSize: 16,
    fontSize: 14,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
  disabledInput: {
    background: '#ececec',
    opacity: 0.7,
  },
  transferIcons: {
    height: '1.5em',
    width: '1.5em',
    cursor: 'pointer',
  },
  transferTitle: {
    margin: '.25em auto',
    fontSize: '1.5em',
    textDecoration: 'underline',
  },
  transferInfoTable: {},
  dropdownPaper: {
    zIndex: 99,
  },
  '@media print': {
    '& .hide-print': {
      width: '0 !important',
      padding: '0 !important',
      margin: '0 !important',
    },
    cardHeaderContent: {
      justifyContent: 'flex-end',
      padding: '8px',
      borderBottom: 'solid 0.5px #605e5e',
      fontSize: '20px',
    },
    formControl: {
      '& > div ': {
        width: 'fit-content !important',
        paddingTop: '0 !important',
        margin: '0 !important',
      },
      '& > div > div': {
        width: 'fit-content !important',
        marginTop: '0 !important',
        '&::before': {
          display: 'none !important',
        },
      },
      '&  > div > label': {
        display: 'none !important',
      },
    },
    valueContainer: {
      display: 'flex !important',
      flexWrap: 'wrap !important',
      flex: 1,
      alignItems: 'center',
      '& + div': {
        display: 'none !important',
      },
      '& + div, & div': {
        display: 'none !important',
      },
    },
    textField: {
      marginBottom: '16px !important',
      '& > div': {
        width: 'fit-content !important',
        marginTop: '0 !important',
        '&::before': {
          display: 'none !important',
        },
      },
      '& > label': {
        display: 'none !important',
      },
    },
    customInput: {
      '& > div': {
        width: 'fit-content !important',
        marginTop: '0 !important',
        '&::before': {
          display: 'none !important',
        },
      },
      '&  label': {
        display: 'none !important',
      },
    },
    productTable: {
      '& .hide-print': {
        display: 'none',
        width: '0 !important',
        padding: '0 !important',
        margin: '0 !important',
      },
      '& .rt-td, & .rt-thead .rt-th': {
        fontSize: '8px !important',
        width: '54px !important',
        flex: '0 0 auto!important',
        margin: 2,
        padding: 0,
      },
      '& .rt-thead .rt-th > div:first-of-type::after': {
        display: 'none !important',
      },
      '& .rt-thead .rt-th': {
        margin: 0,
        textAlign: 'center',
        fontWeight: 'normal !important',
        fontStretch: 'normal !important',
        fontStyle: 'normal !important',
        lineHeight: 'normal !important',
        letterSpacing: '0.04px !important',
        color: '#2f2e2e !important !important',
        '& > div:first-of-type::after': {
          display: 'none !important',
        },
      },
    },
  },
});
