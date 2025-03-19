import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Autocomplete,
  Chip,
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { ExpandLess, ExpandMore, FilterList } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useOrdersData } from '@/hooks/useOrdersData';
import { Order, Dealer, Vehicle } from '@/types';
import { dealersApi, ordersApi, vehiclesApi } from '@/api/supabase';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from '@/types/date-range';
import { OrderDetailsDialogAdapter, OrderDetailsFormAdapter } from '@/components/orders/OrderDialogAdapters';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

interface OrderDetailsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const Orders = () => {
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLicensableFilter, setIsLicensableFilter] = useState<boolean | null>(null);
  const [hasProformaFilter, setHasProformaFilter] = useState<boolean | null>(null);
  const [isPaidFilter, setIsPaidFilter] = useState<boolean | null>(null);
  const [isInvoicedFilter, setIsInvoicedFilter] = useState<boolean | null>(null);
  const [hasConformityFilter, setHasConformityFilter] = useState<boolean | null>(null);
  const [dealerIdFilter, setDealerIdFilter] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<string | null>(null);

  // Fetch vehicles and dealers data
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  });
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
  });

  // Extract unique model names and dealer names
  const modelNames = [...new Set(vehicles.map((vehicle) => vehicle.model))];
  const dealerNames = [...new Set(dealers.map((dealer) => dealer.companyName))];

  // Prepare filters for useOrdersData hook
  const filters = {
    isLicensable: isLicensableFilter,
    hasProforma: hasProformaFilter,
    isPaid: isPaidFilter,
    isInvoiced: isInvoicedFilter,
    hasConformity: hasConformityFilter,
    dealerId: dealerIdFilter,
    model: modelFilter,
  };

  // Use the useOrdersData hook with the filters
  const {
    ordersData,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    isLoading,
    error,
    refreshAllOrderData,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    refetchOrders,
    getOrderNumber
  } = useOrdersData(filters);

  // State to manage the selected order for the details dialog
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Handler to open the details dialog
  const handleViewDetails = (order: Order) => {
    setSelectedOrderForDetails(order);
    setIsDetailsDialogOpen(true);
  };

  // Handler to close the details dialog
  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedOrderForDetails(null);
  };

  // Function to apply filters
  const applyFilters = () => {
    // Convert selected dealer names to dealer IDs
    const dealerIds = dealers
      .filter((dealer) => selectedDealers.includes(dealer.companyName))
      .map((dealer) => dealer.id);

    // Set the filters based on the selections
    setDealerIdFilter(dealerIds.length > 0 ? dealerIds[0] : null); // Assuming single select for dealer
    setModelFilter(selectedModels.length > 0 ? selectedModels[0] : null); // Assuming single select for model
  };

  // Function to clear filters
  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedModels([]);
    setSelectedDealers([]);
    setIsLicensableFilter(null);
    setHasProformaFilter(null);
    setIsPaidFilter(null);
    setIsInvoicedFilter(null);
    setHasConformityFilter(null);
    setDealerIdFilter(null);
    setModelFilter(null);
    setSearchText('');
  };

  // Function to handle ODL generation
  const handleGenerateODL = async (order: Order) => {
    try {
      await ordersApi.generateODL(order.id);
      toast({
        title: "ODL Generato",
        description: "ODL generato con successo per l'ordine.",
      });
      refreshAllOrderData(); // Refresh data to reflect the change
    } catch (e) {
      console.error("Error generating ODL:", e);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione dell'ODL.",
        variant: "destructive",
      });
    }
  };

  // Function to handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await ordersApi.delete(orderId);
      toast({
        title: "Ordine Eliminato",
        description: "Ordine eliminato con successo.",
      });
      setDeleteDialogOpen(false); // Close the dialog
      refreshAllOrderData(); // Refresh data to reflect the change
    } catch (e) {
      console.error("Error deleting order:", e);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'ordine.",
        variant: "destructive",
      });
    }
  };

  // Function to confirm order deletion
  const confirmDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  // Function to handle edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  // Function to close edit dialog
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
  };

  // Determine which orders to display based on the tab
  let ordersToDisplay = allOrders;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ordini
        </Typography>

        {/* Filter and Search Section */}
        <Paper sx={{ padding: 2, marginBottom: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              startIcon={<FilterList />}
            >
              Filtri
            </Button>
            <TextField
              label="Cerca..."
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Box>

          <Collapse in={isFilterOpen} timeout="auto" unmountOnExit>
            <Box mt={3} display="grid" gap={2} gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))">
              {/* Date Range Picker */}
              <DateRangePicker
                value={[dateRange.from ? dayjs(dateRange.from) : null, dateRange.to ? dayjs(dateRange.to) : null] as [Dayjs | null, Dayjs | null]}
                onChange={(newValue: [Dayjs | null, Dayjs | null]) => {
                  setDateRange({
                    from: newValue[0]?.toDate(),
                    to: newValue[1]?.toDate(),
                  });
                }}
                renderInput={(startProps, endProps) => (
                  <>
                    <TextField {...startProps} size="small" label="Data Inizio" />
                    <Box sx={{ mx: 2 }}> a </Box>
                    <TextField {...endProps} size="small" label="Data Fine" />
                  </>
                )}
              />

              {/* Model and Dealer Autocomplete Filters */}
              <Autocomplete
                multiple
                options={modelNames}
                value={selectedModels}
                onChange={(event: any, newValue: string[]) => {
                  setSelectedModels(newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Modelli" size="small" />
                )}
              />
              <Autocomplete
                multiple
                options={dealerNames}
                value={selectedDealers}
                onChange={(event: any, newValue: string[]) => {
                  setSelectedDealers(newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Concessionari" size="small" />
                )}
              />

              {/* Checkbox Filters */}
              <FormControlLabel
                control={<Checkbox checked={isLicensableFilter === true} onChange={(e) => setIsLicensableFilter(e.target.checked)} />}
                label="Licenziabile"
              />
              <FormControlLabel
                control={<Checkbox checked={hasProformaFilter === true} onChange={(e) => setHasProformaFilter(e.target.checked)} />}
                label="Ha Proforma"
              />
              <FormControlLabel
                control={<Checkbox checked={isPaidFilter === true} onChange={(e) => setIsPaidFilter(e.target.checked)} />}
                label="Pagato"
              />
              <FormControlLabel
                control={<Checkbox checked={isInvoicedFilter === true} onChange={(e) => setIsInvoicedFilter(e.target.checked)} />}
                label="Fatturato"
              />
              <FormControlLabel
                control={<Checkbox checked={hasConformityFilter === true} onChange={(e) => setHasConformityFilter(e.target.checked)} />}
                label="Ha Conformità"
              />
            </Box>

            {/* Filter Actions */}
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={clearFilters} sx={{ mr: 1 }}>
                Cancella Filtri
              </Button>
              <Button variant="contained" onClick={applyFilters}>
                Applica Filtri
              </Button>
            </Box>
          </Collapse>
        </Paper>

        {/* Order Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Numero Ordine</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Modello</TableCell>
                <TableCell>Concessionario</TableCell>
                <TableCell>Data Ordine</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell align="center" colSpan={8}>Caricamento...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell align="center" colSpan={8}>Errore: {error.message}</TableCell>
                </TableRow>
              ) : ordersToDisplay.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={8}>Nessun ordine trovato.</TableCell>
                </TableRow>
              ) : (
                ordersToDisplay.map((order) => (
                  <StyledTableRow key={order.id}>
                    <TableCell component="th" scope="row">
                      {order.id}
                    </TableCell>
                    <TableCell>{getOrderNumber(order)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.modelName}</TableCell>
                    <TableCell>{order.dealerName}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => handleViewDetails(order)}>
                          Dettagli
                        </Button>
                        <Button size="small" onClick={() => handleEditOrder(order)}>
                          Modifica
                        </Button>
                        <Button size="small" onClick={() => handleGenerateODL(order)}>
                          Genera ODL
                        </Button>
                        <Button size="small" color="error" onClick={() => confirmDeleteOrder(order)}>
                          Elimina
                        </Button>
                      </Stack>
                    </TableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Eliminare l'ordine?"}</DialogTitle>
          <DialogContent>
            <Typography>Sei sicuro di voler eliminare questo ordine? Questa azione è irreversibile.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
            <Button onClick={() => handleDeleteOrder(selectedOrder!.id)} autoFocus>
              Elimina
            </Button>
          </DialogActions>
        </Dialog>

        {/* Order Details Dialog */}
        <OrderDetailsDialogAdapter
          isOpen={isDetailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          order={selectedOrderForDetails}
        />

        {/* Edit Order Dialog */}
        <OrderDetailsFormAdapter
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          order={selectedOrder}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Orders;
