import Moment from 'react-moment';
export default function columns(module, settings) {
  let columns = [
    {
      name: 'id',
      label: 'ID',
      options: {
        filter: false,
        display: false,
      },
      type: 'Text',
      disabled: true,
      required: false,
      id: 'id',
      section: 'System Information'
    },
    {
      name: 'orderId',
      label: 'Order Id#',
      primary: true,
      options: {
        filter: true
      },
      type: 'Text',
      required: false,
      id: 'orderId',
      section: 'Order Information'
    },
    {
      name: 'orderDate',
      label: 'Order Date',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => {
          return (
            <Moment format={settings.dateFormat}>
              {value}
            </Moment>
          );
        }
      },
      type: 'Date',
      required: false,
      id: 'orderDate',
      section: 'Order Information'
    },
    {
      name: 'deliveryDate',
      label: 'Delivery Date',
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => {
          return (
            <Moment format={settings.dateFormat}>
              {value}
            </Moment>
          )
        }
      },
      type: 'Date',
      required: false,
      id: 'deliveryDate',
      section: 'Order Information'
    },
    {
      name: 'orderStatus',
      label: 'Order Status',
      options: {
        filter: true,
      },
      data: [
        { 'id': 'confirmed', 'value': 'confirmed' },
        { 'id': 'underway', 'value': 'underway' },
        { 'id': 'completed', 'value': 'completed' },
        { 'id': 'cancelled', 'value': 'cancelled' }
      ],
      type: 'Select',
      required: false,
      id: 'orderStatus',
      section: 'Order Information'
    },
    {
      name: 'orderedItems',
      label: 'Ordered Items',
      type: 'DynamicSet',
      id: 'orderedItems',
      required: true,
      options: {
        filter: false,
        customBodyRender: (value) => {
          return value ? value.length : 0;
        }
      },
      fields: [
        [
          { name: 'itemId', options: {}, id: 'itemId', label: 'Items', type: 'Lookup', module: 'items', moduleField: 'name', required: true, },
          { name: 'quantity', options: {}, id: 'quantity', label: 'Quantity', type: 'Text', required: true, },
        //  { type: 'ReadOnly', options: {},label:'Cost' },
          { type: 'Action', options: {}, },]
      ],
      section: 'Order Items'
    },
    {
      name: 'fk_customerId',
      id: 'fk_customerId',
      fk: true,
      module: 'customers',
      moduleField: 'name',
      label: 'Customer',
      options: {
        filter: true,
        customBodyRender: (value) => {
          return value.name;
        }
      },
      type: 'Lookup',
      required: true,
      section: 'Order Information'
    },
    {
      name: 'fk_soldBy',
      id: 'fk_soldBy',
      fk: true,
      module: 'users',
      moduleField: 'fullName',
      label: 'Sold By',
      options: {
        filter: true,
        customBodyRender: (value) => {
          return value.fullName;
        }
      },
      type: 'Lookup',
      required: true,
      section: 'Order Information'
    },
    {
      name: 'customerNotes',
      label: 'Customer Notes',
      options: {
        filter: true,
        display: false,
      },
      type: 'TextArea',
      required: false,
      id: 'customerNotes',
      section: 'Order Information'
    },
    {
      name: 'fk_createdBy',
      id: 'fk_createdBy',
      fk: true,
      module: 'users',
      moduleField: 'fullName',
      label: 'Created By',
      options: {
        filter: true,
        customBodyRender: (value) => {
          return value.fullName;
        }
      },
      type: 'Lookup',
      disabled: true,
      required: true,
      section: 'System Information'
    },
    {
      name: 'fk_updatedBy',
      label: 'Updated By',
      fk: true,
      module: 'users',
      moduleField: 'fullName',
      options: {
        filter: false,
        customBodyRender: (value) => {
          return value.fullName;
        }
      },
      type: 'Lookup',
      disabled: true,
      required: true,
      id: 'fk_updatedBy',
      section: 'System Information'
    },
    {
      name: 'createdAt',
      id: 'createdAt',
      label: 'Created On',
      type: 'Date',
      disabled: true,
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => {
          return (
            <Moment format={settings.dateFormat}>
              {value}
            </Moment>
          );
        }
      },
      section: 'System Information'
    },
    {
      name: 'updatedAt',
      id: 'createdAt',
      label: 'Updated On',
      type: 'Date',
      disabled: true,
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value) => {
          return (
            <Moment format={settings.dateFormat}>
              {value}
            </Moment>
          );
        }
      },
      section: 'System Information'
    }
  ];
  return columns;
}