
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Boxes, Package, Droplets, Replace } from 'lucide-react';
import { format } from 'date-fns';

const inventoryData = {
  catheters: [
    { type: 'Straight', quantity: 42, nextArrival: '2024-08-15' },
    { type: 'Coiled', quantity: 28, nextArrival: '2024-08-15' },
  ],
  pdFluids: [
    { type: '1.5% Dextrose', quantity: 250, unit: 'bags', nextArrival: '2024-08-07' },
    { type: '2.5% Dextrose', quantity: 180, unit: 'bags', nextArrival: '2024-08-07' },
    { type: '7.5% Icodextrin', quantity: 95, unit: 'bags', nextArrival: '2024-08-20' },
  ],
  apdFluids: [
    { type: 'Dianeal Low Calcium (1.5%)', quantity: 150, unit: 'bags', nextArrival: '2024-08-10' },
    { type: 'Dianeal Low Calcium (2.5%)', quantity: 120, unit: 'bags', nextArrival: '2024-08-10' },
    { type: 'Extraneal (7.5% Icodextrin)', quantity: 80, unit: 'bags', nextArrival: '2024-08-25' },
  ],
  transferSets: {
    quantity: 150,
    unit: 'sets',
    nextArrival: '2024-08-05'
  }
};

const getStatusVariant = (quantity: number): "destructive" | "outline" | "secondary" => {
  if (quantity < 50) return 'destructive';
  if (quantity < 100) return 'outline';
  return 'secondary';
};

const getStatusLabel = (quantity: number) => {
    if (quantity < 50) return 'Critical Low';
    if (quantity < 100) return 'Low Stock';
    return 'In Stock';
}


export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Boxes className="h-8 w-8 text-primary" />
          Inventory Status
        </h1>
        <p className="text-muted-foreground mt-1">
          A real-time overview of available Peritoneal Dialysis supplies.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* PD Catheters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package /> PD Catheters
            </CardTitle>
            <CardDescription>Current stock of available catheters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.catheters.map(item => (
                  <TableRow key={item.type}>
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.quantity)}>
                        {getStatusLabel(item.quantity)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Next lot arriving around {format(new Date(inventoryData.catheters[0].nextArrival), 'PPP')}.
            </p>
          </CardContent>
        </Card>
        
        {/* PD Fluids Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Droplets /> Manual PD Fluids
            </CardTitle>
            <CardDescription>Stock levels for CAPD fluid bags.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solution</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.pdFluids.map(item => (
                  <TableRow key={item.type}>
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusVariant(item.quantity)}>
                        {getStatusLabel(item.quantity)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <p className="text-xs text-muted-foreground mt-4 text-center">
              Next lot of Dextrose arriving around {format(new Date(inventoryData.pdFluids[0].nextArrival), 'PPP')}.
            </p>
          </CardContent>
        </Card>

        {/* APD Fluids Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Droplets /> APD Fluids
            </CardTitle>
            <CardDescription>Stock levels for automated PD fluid bags.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solution</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.apdFluids.map(item => (
                  <TableRow key={item.type}>
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusVariant(item.quantity)}>
                        {getStatusLabel(item.quantity)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <p className="text-xs text-muted-foreground mt-4 text-center">
              Next APD lot arriving around {format(new Date(inventoryData.apdFluids[0].nextArrival), 'PPP')}.
            </p>
          </CardContent>
        </Card>
        
        {/* Transfer Sets Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Replace /> Transfer Sets
            </CardTitle>
            <CardDescription>Current stock of transfer sets.</CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <p className="text-5xl font-bold">{inventoryData.transferSets.quantity}</p>
            <p className="text-muted-foreground mb-4">{inventoryData.transferSets.unit}</p>
            <Badge variant={getStatusVariant(inventoryData.transferSets.quantity)}>
                {getStatusLabel(inventoryData.transferSets.quantity)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Next lot arriving around {format(new Date(inventoryData.transferSets.nextArrival), 'PPP')}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
