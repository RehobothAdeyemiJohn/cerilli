
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/api/supabase/client';
import { 
  Database, 
  Table, 
  RefreshCcw, 
  AlertTriangle,
  ArrowUpFromLine
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  vehiclesApi, 
  quotesApi, 
  ordersApi,
  modelsApi,
  trimsApi,
  fuelTypesApi,
  colorsApi,
  transmissionsApi,
  accessoriesApi,
  adminUsersApi
} from '@/api/localStorage';

interface TableCreationProps {
  tableName: string;
  createFunction: string;
  exists: boolean;
  onSuccess?: () => void;
}

interface MigrationFunctionProps {
  tableName: string;
  migrationFunction: () => Promise<void>;
  buttonText: string;
  successText: string;
  errorText: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const TableCreationButton: React.FC<TableCreationProps> = ({ 
  tableName, 
  createFunction, 
  exists, 
  onSuccess 
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const createTable = async () => {
    setIsCreating(true);
    
    try {
      const { error } = await supabase.rpc(createFunction);
      
      if (error) {
        console.error(`Error creating ${tableName} table:`, error);
        toast.error(`Errore nella creazione della tabella ${tableName}`);
        return;
      }
      
      toast.success(`Tabella ${tableName} creata con successo!`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Error creating ${tableName} table:`, error);
      toast.error(`Errore nella creazione della tabella ${tableName}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={createTable} 
      disabled={isCreating || exists}
      variant={exists ? "outline" : "default"}
      size="sm"
      className="w-full mb-2"
    >
      <Table className="mr-2 h-4 w-4" />
      {exists 
        ? `${tableName} (già presente)` 
        : isCreating 
          ? `Creazione ${tableName} in corso...` 
          : `Crea tabella ${tableName}`
      }
    </Button>
  );
};

const MigrationButton: React.FC<MigrationFunctionProps> = ({
  tableName,
  migrationFunction,
  buttonText,
  successText,
  errorText,
  icon,
  disabled = false
}) => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    
    try {
      await migrationFunction();
      toast.success(successText);
    } catch (error) {
      console.error(`Error migrating ${tableName}:`, error);
      toast.error(errorText);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button 
      onClick={handleMigration} 
      disabled={isMigrating || disabled}
      variant="secondary"
      size="sm"
      className="w-full mb-2"
    >
      {icon || <ArrowUpFromLine className="mr-2 h-4 w-4" />}
      {isMigrating ? `Migrazione ${tableName} in corso...` : buttonText}
    </Button>
  );
};

export const DataMigration: React.FC<{
  tablesInfo?: any;
  onSuccess?: () => void;
}> = ({ tablesInfo, onSuccess }) => {
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isMigratingData, setIsMigratingData] = useState(false);
  const [migrateDialogOpen, setMigrateDialogOpen] = useState(false);

  const createTables = async () => {
    setIsCreatingTables(true);
    
    try {
      // Create Dealers table
      const { error: dealersError } = await supabase.rpc('create_dealers_table');
      
      if (dealersError) {
        console.error('Error creating dealers table:', dealersError);
        toast.error('Errore nella creazione della tabella dealers');
        return;
      }
      
      // Create Vehicles table
      const { error: vehiclesError } = await supabase.rpc('create_vehicles_table');
      
      if (vehiclesError) {
        console.error('Error creating vehicles table:', vehiclesError);
        toast.error('Errore nella creazione della tabella vehicles');
        return;
      }
      
      // Create Quotes table
      const { error: quotesError } = await supabase.rpc('create_quotes_table');
      
      if (quotesError) {
        console.error('Error creating quotes table:', quotesError);
        toast.error('Errore nella creazione della tabella quotes');
        return;
      }
      
      // Create Orders table
      const { error: ordersError } = await supabase.rpc('create_orders_table');
      
      if (ordersError) {
        console.error('Error creating orders table:', ordersError);
        toast.error('Errore nella creazione della tabella orders');
        return;
      }
      
      toast.success('Tabelle create con successo!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating tables:', error);
      toast.error('Errore nella creazione delle tabelle');
    } finally {
      setIsCreatingTables(false);
    }
  };

  const resetDatabase = async () => {
    setIsResettingDatabase(true);
    
    try {
      // Drop tables in correct order to respect foreign key constraints
      const { error: ordersError } = await supabase.rpc('drop_orders_table_if_exists');
      if (ordersError) {
        console.error('Error dropping orders table:', ordersError);
        toast.error('Errore nell\'eliminazione della tabella orders');
        return;
      }
      
      const { error: quotesError } = await supabase.rpc('drop_quotes_table_if_exists');
      if (quotesError) {
        console.error('Error dropping quotes table:', quotesError);
        toast.error('Errore nell\'eliminazione della tabella quotes');
        return;
      }
      
      const { error: vehiclesError } = await supabase.rpc('drop_vehicles_table_if_exists');
      if (vehiclesError) {
        console.error('Error dropping vehicles table:', vehiclesError);
        toast.error('Errore nell\'eliminazione della tabella vehicles');
        return;
      }
      
      const { error: dealersError } = await supabase.rpc('drop_dealers_table_if_exists');
      if (dealersError) {
        console.error('Error dropping dealers table:', dealersError);
        toast.error('Errore nell\'eliminazione della tabella dealers');
        return;
      }
      
      toast.success('Database azzerato con successo!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Errore nell\'azzeramento del database');
    } finally {
      setIsResettingDatabase(false);
      setResetDialogOpen(false);
    }
  };

  // Migrazione dati da localStorage a Supabase
  const migrateVehicles = async () => {
    const vehicles = await vehiclesApi.getAll();
    for (const vehicle of vehicles) {
      const { error } = await supabase.rpc('insert_vehicle', {
        p_model: vehicle.model,
        p_location: vehicle.location,
        p_trim: vehicle.trim || null,
        p_fueltype: vehicle.fuelType || null,
        p_exteriorcolor: vehicle.exteriorColor || null,
        p_accessories: vehicle.accessories || [],
        p_price: vehicle.price || null,
        p_imageurl: vehicle.imageUrl || null,
        p_status: vehicle.status || 'available',
        p_dateadded: vehicle.dateAdded || new Date().toISOString().split('T')[0],
        p_telaio: vehicle.telaio || null,
        p_transmission: vehicle.transmission || null,
        p_reservedby: vehicle.reservedBy || null,
        p_reservedaccessories: vehicle.reservedAccessories || [],
        p_virtualconfig: vehicle.virtualConfig || null
      });
      
      if (error) {
        console.error('Error migrating vehicle:', error);
        throw error;
      }
    }
  };

  const migrateDealers = async () => {
    const dealers = await supabase.from('dealers').select('*');
    if (dealers.error) {
      throw dealers.error;
    }
    
    if (dealers.data.length > 0) {
      console.log('Dealers already migrated, skipping...');
      return;
    }
    
    // Import dealers from mock data
    const mockDealers = [
      {
        companyname: "Concessionaria Rossi",
        address: "Via Roma 123",
        city: "Milano",
        province: "MI",
        zipcode: "20100",
        contactname: "Mario Rossi",
        email: "mrossi@example.com",
        password: "password123",
        isactive: true
      },
      {
        companyname: "Auto Bianchi",
        address: "Corso Italia 456",
        city: "Roma",
        province: "RM",
        zipcode: "00100",
        contactname: "Luigi Bianchi",
        email: "lbianchi@example.com",
        password: "password123",
        isactive: true
      },
      {
        companyname: "Vendita Auto Verdi",
        address: "Piazza Garibaldi 789",
        city: "Napoli",
        province: "NA",
        zipcode: "80100",
        contactname: "Giuseppe Verdi",
        email: "gverdi@example.com",
        password: "password123",
        isactive: true
      }
    ];
    
    for (const dealer of mockDealers) {
      const { error } = await supabase.rpc('insert_dealer', {
        p_companyname: dealer.companyname,
        p_address: dealer.address,
        p_city: dealer.city,
        p_province: dealer.province,
        p_zipcode: dealer.zipcode,
        p_contactname: dealer.contactname,
        p_email: dealer.email,
        p_password: dealer.password,
        p_isactive: dealer.isactive
      });
      
      if (error) {
        console.error('Error migrating dealer:', error);
        throw error;
      }
    }
  };

  const migrateQuotes = async () => {
    const quotes = await quotesApi.getAll();
    
    // Get first dealer ID for reference
    const { data: dealers, error: dealersError } = await supabase.from('dealers').select('id').limit(1);
    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      throw dealersError;
    }
    
    if (!dealers || dealers.length === 0) {
      console.error('No dealers found, cannot migrate quotes');
      throw new Error('No dealers found');
    }
    
    const defaultDealerId = dealers[0].id;
    
    for (const quote of quotes) {
      // Get vehicle ID from Supabase
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('model', quote.vehicleId) // Semplificazione, in realtà bisognerebbe fare una query più specifica
        .limit(1);
      
      if (vehiclesError) {
        console.error('Error fetching vehicle:', vehiclesError);
        continue;
      }
      
      const vehicleId = vehicles && vehicles.length > 0 ? vehicles[0].id : null;
      
      if (!vehicleId) {
        console.warn(`Vehicle not found for quote ${quote.id}, using default vehicle`);
        continue;
      }
      
      const { error } = await supabase.rpc('insert_quote', {
        p_vehicleid: vehicleId,
        p_dealerid: defaultDealerId,
        p_customername: quote.customerName,
        p_customeremail: quote.customerEmail || null,
        p_customerphone: quote.customerPhone || null,
        p_price: quote.price,
        p_discount: quote.discount || 0,
        p_finalprice: quote.finalPrice,
        p_status: quote.status || 'pending',
        p_createdat: quote.createdAt || new Date().toISOString()
      });
      
      if (error) {
        console.error('Error migrating quote:', error);
        throw error;
      }
    }
  };

  const migrateOrders = async () => {
    const orders = await ordersApi.getAll();
    
    // Get first dealer ID for reference
    const { data: dealers, error: dealersError } = await supabase.from('dealers').select('id').limit(1);
    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      throw dealersError;
    }
    
    if (!dealers || dealers.length === 0) {
      console.error('No dealers found, cannot migrate orders');
      throw new Error('No dealers found');
    }
    
    const defaultDealerId = dealers[0].id;
    
    for (const order of orders) {
      // Get vehicle ID from Supabase
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('model', order.vehicleId) // Semplificazione, in realtà bisognerebbe fare una query più specifica
        .limit(1);
      
      if (vehiclesError) {
        console.error('Error fetching vehicle:', vehiclesError);
        continue;
      }
      
      const vehicleId = vehicles && vehicles.length > 0 ? vehicles[0].id : null;
      
      if (!vehicleId) {
        console.warn(`Vehicle not found for order ${order.id}, using default vehicle`);
        continue;
      }
      
      const { error } = await supabase.rpc('insert_order', {
        p_vehicleid: vehicleId,
        p_dealerid: defaultDealerId,
        p_customername: order.customerName,
        p_quoteid: null, // Non abbiamo il mapping delle quote IDs
        p_status: order.status || 'processing',
        p_orderdate: order.orderDate || new Date().toISOString(),
        p_deliverydate: order.deliveryDate || null
      });
      
      if (error) {
        console.error('Error migrating order:', error);
        throw error;
      }
    }
  };

  const migrateSettings = async () => {
    // Migra modelli
    const models = await modelsApi.getAll();
    for (const model of models) {
      const { error } = await supabase.rpc('insert_model', {
        p_name: model.name,
        p_base_price: model.basePrice
      });
      
      if (error) {
        console.error('Error migrating model:', error);
        throw error;
      }
    }
    
    // Migra trim
    const trims = await trimsApi.getAll();
    for (const trim of trims) {
      const { error } = await supabase.from('settings_trims').insert({
        name: trim.name,
        price_adjustment: trim.basePrice,
        compatible_models: trim.compatibleModels || []
      });
      
      if (error) {
        console.error('Error migrating trim:', error);
        throw error;
      }
    }
    
    // Migra fuel types
    const fuelTypes = await fuelTypesApi.getAll();
    for (const fuelType of fuelTypes) {
      const { error } = await supabase.from('settings_fuel_types').insert({
        name: fuelType.name,
        price_adjustment: fuelType.priceAdjustment,
        compatible_models: fuelType.compatibleModels || []
      });
      
      if (error) {
        console.error('Error migrating fuel type:', error);
        throw error;
      }
    }
    
    // Migra colors
    const colors = await colorsApi.getAll();
    for (const color of colors) {
      const { error } = await supabase.from('settings_colors').insert({
        name: color.name,
        type: color.type,
        price_adjustment: color.priceAdjustment
      });
      
      if (error) {
        console.error('Error migrating color:', error);
        throw error;
      }
    }
    
    // Migra trasmissioni
    const transmissions = await transmissionsApi.getAll();
    for (const transmission of transmissions) {
      const { error } = await supabase.from('settings_transmissions').insert({
        name: transmission.name,
        price_adjustment: transmission.priceAdjustment,
        compatible_models: transmission.compatibleModels || []
      });
      
      if (error) {
        console.error('Error migrating transmission:', error);
        throw error;
      }
    }
    
    // Migra accessori
    const accessories = await accessoriesApi.getAll();
    for (const accessory of accessories) {
      const { error } = await supabase.from('settings_accessories').insert({
        name: accessory.name,
        price: accessory.priceWithVAT,
        compatible_models: accessory.compatibleModels || [],
        compatible_trims: accessory.compatibleTrims || []
      });
      
      if (error) {
        console.error('Error migrating accessory:', error);
        throw error;
      }
    }
  };

  const migrateAdminUsers = async () => {
    const adminUsers = await adminUsersApi.getAll();
    for (const user of adminUsers) {
      const { error } = await supabase.rpc('insert_admin_user', {
        p_first_name: user.firstName,
        p_last_name: user.lastName,
        p_email: user.email,
        p_password: user.password,
        p_role: user.role,
        p_permissions: user.permissions || [],
        p_active: user.isActive
      });
      
      if (error) {
        console.error('Error migrating admin user:', error);
        throw error;
      }
    }
  };

  const migrateAllData = async () => {
    setIsMigratingData(true);
    
    try {
      // Migrate in correct order to respect foreign keys
      await migrateDealers();
      await migrateVehicles();
      await migrateQuotes();
      await migrateOrders();
      await migrateSettings();
      await migrateAdminUsers();
      
      toast.success('Tutti i dati sono stati migrati con successo!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error migrating data:', error);
      toast.error('Errore durante la migrazione dei dati');
    } finally {
      setIsMigratingData(false);
      setMigrateDialogOpen(false);
    }
  };

  const allTablesExist = tablesInfo && 
    tablesInfo.vehicles.exists && 
    tablesInfo.dealers.exists && 
    tablesInfo.quotes.exists && 
    tablesInfo.orders.exists;

  const noTablesExist = tablesInfo && 
    !tablesInfo.vehicles.exists && 
    !tablesInfo.dealers.exists && 
    !tablesInfo.quotes.exists && 
    !tablesInfo.orders.exists;

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm">
            {noTablesExist ? (
              <p className="mb-2">Il database è vuoto. Puoi creare le tabelle necessarie per l'applicazione:</p>
            ) : !allTablesExist ? (
              <p className="mb-2">Alcune tabelle sono mancanti. Puoi crearle singolarmente o tutte insieme:</p>
            ) : (
              <p className="mb-2">Tutte le tabelle sono presenti nel database.</p>
            )}

            {!allTablesExist && (
              <Button 
                onClick={createTables} 
                disabled={isCreatingTables}
                className="w-full mb-4"
              >
                <Database className="mr-2 h-4 w-4" />
                {isCreatingTables ? 'Creazione tabelle in corso...' : 'Crea Tutte le Tabelle'}
              </Button>
            )}

            {tablesInfo && (
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-sm">Creazione Tabelle Individuali:</h3>
                <div className="space-y-2">
                  <TableCreationButton 
                    tableName="Dealers" 
                    createFunction="create_dealers_table" 
                    exists={tablesInfo.dealers.exists}
                    onSuccess={onSuccess}
                  />
                  <TableCreationButton 
                    tableName="Vehicles" 
                    createFunction="create_vehicles_table" 
                    exists={tablesInfo.vehicles.exists}
                    onSuccess={onSuccess}
                  />
                  <TableCreationButton 
                    tableName="Quotes" 
                    createFunction="create_quotes_table" 
                    exists={tablesInfo.quotes.exists}
                    onSuccess={onSuccess}
                  />
                  <TableCreationButton 
                    tableName="Orders" 
                    createFunction="create_orders_table" 
                    exists={tablesInfo.orders.exists}
                    onSuccess={onSuccess}
                  />
                </div>
              </div>
            )}

            {allTablesExist && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-2 text-sm">Migrazione Dati:</h3>
                <Dialog open={migrateDialogOpen} onOpenChange={setMigrateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full mb-4"
                    >
                      <ArrowUpFromLine className="mr-2 h-4 w-4" />
                      Migra Tutti i Dati da LocalStorage
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Conferma Migrazione Dati</DialogTitle>
                      <DialogDescription>
                        Questa azione migrerà tutti i dati esistenti in localStorage a Supabase.
                        Se alcuni dati sono già presenti in Supabase, potrebbero verificarsi errori o duplicazioni.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200 mt-2">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Attenzione:</p>
                          <p>L'operazione potrebbe richiedere del tempo e non può essere annullata!</p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setMigrateDialogOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={migrateAllData}
                        disabled={isMigratingData}
                      >
                        {isMigratingData ? 'Migrazione in corso...' : 'Conferma Migrazione'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2">
                  <h4 className="text-xs text-gray-500 mb-1">Migrazione per Categoria:</h4>
                  <MigrationButton 
                    tableName="Veicoli"
                    migrationFunction={migrateVehicles}
                    buttonText="Migra Veicoli"
                    successText="Veicoli migrati con successo!"
                    errorText="Errore durante la migrazione dei veicoli"
                  />
                  <MigrationButton 
                    tableName="Dealers"
                    migrationFunction={migrateDealers}
                    buttonText="Migra Dealers"
                    successText="Dealers migrati con successo!"
                    errorText="Errore durante la migrazione dei dealers"
                  />
                  <MigrationButton 
                    tableName="Preventivi"
                    migrationFunction={migrateQuotes}
                    buttonText="Migra Preventivi"
                    successText="Preventivi migrati con successo!"
                    errorText="Errore durante la migrazione dei preventivi"
                  />
                  <MigrationButton 
                    tableName="Ordini"
                    migrationFunction={migrateOrders}
                    buttonText="Migra Ordini"
                    successText="Ordini migrati con successo!"
                    errorText="Errore durante la migrazione degli ordini"
                  />
                  <MigrationButton 
                    tableName="Impostazioni"
                    migrationFunction={migrateSettings}
                    buttonText="Migra Impostazioni"
                    successText="Impostazioni migrate con successo!"
                    errorText="Errore durante la migrazione delle impostazioni"
                  />
                  <MigrationButton 
                    tableName="Utenti Admin"
                    migrationFunction={migrateAdminUsers}
                    buttonText="Migra Utenti Admin"
                    successText="Utenti Admin migrati con successo!"
                    errorText="Errore durante la migrazione degli utenti admin"
                  />
                </div>
              </div>
            )}

            {tablesInfo && !noTablesExist && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-2 text-sm">Reset Database:</h3>
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      className="w-full"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Azzera Database
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Conferma Reset Database</DialogTitle>
                      <DialogDescription>
                        Questa azione eliminerà tutte le tabelle e i dati presenti nel database. 
                        L'operazione non può essere annullata.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200 mt-2">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Attenzione:</p>
                          <p>Tutti i dati saranno eliminati permanentemente!</p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setResetDialogOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={resetDatabase}
                        disabled={isResettingDatabase}
                      >
                        {isResettingDatabase ? 'Eliminazione in corso...' : 'Conferma Reset'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigration;
