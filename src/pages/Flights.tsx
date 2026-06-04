import React, { useState } from 'react';
import {
  Plane,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { formatDate, reservationStatusLabel } from '../lib/supabase';
import { mockReservations } from '../lib/mockData';

interface FlightStatus {
  reservationId: string;
  status: 'on_time' | 'delayed' | 'cancelled' | 'unknown';
  scheduledDeparture: string;
  actualDeparture?: string;
}

interface ExpandedFlight {
  [key: string]: boolean;
}

const getFlightStatusIcon = (status: string) => {
  switch (status) {
    case 'on_time':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'delayed':
      return <Clock className="w-5 h-5 text-amber-400" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getFlightStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'on_time':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'delayed':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getFlightStatusLabel = (status: string) => {
  switch (status) {
    case 'on_time':
      return 'À l\'heure';
    case 'delayed':
      return 'Retardé';
    case 'cancelled':
      return 'Annulé';
    default:
      return 'Inconnu';
  }
};

export default function FlightsPage() {
  const [flightStatuses, setFlightStatuses] = useState<FlightStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [expandedFlights, setExpandedFlights] = useState<ExpandedFlight>({});
  const [statusChecked, setStatusChecked] = useState(false);

  const reservationsWithFlights = mockReservations.filter((r) => r.flight_number);

  const handleCheckFlights = () => {
    setIsChecking(true);

    setTimeout(() => {
      const statuses: FlightStatus[] = reservationsWithFlights.map((reservation) => {
        const statusOptions: Array<'on_time' | 'delayed' | 'cancelled' | 'unknown'> = [
          'on_time',
          'delayed',
          'cancelled',
          'unknown',
        ];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        const baseTime = new Date(reservation.ride_datetime);
        const delayMinutes = randomStatus === 'delayed' ? Math.floor(Math.random() * 120) + 15 : 0;
        const actualTime = new Date(baseTime.getTime() + delayMinutes * 60000);

        return {
          reservationId: reservation.id,
          status: randomStatus,
          scheduledDeparture: baseTime.toISOString(),
          actualDeparture: randomStatus !== 'cancelled' ? actualTime.toISOString() : undefined,
        };
      });

      setFlightStatuses(statuses);
      setStatusChecked(true);
      setIsChecking(false);
    }, 1500);
  };

  const toggleFlightExpand = (reservationId: string) => {
    setExpandedFlights((prev) => ({
      ...prev,
      [reservationId]: !prev[reservationId],
    }));
  };

  const getAdjustedPickupTime = (flightStatus: FlightStatus) => {
    if (!flightStatus.actualDeparture) return null;
    const actualTime = new Date(flightStatus.actualDeparture);
    actualTime.setHours(actualTime.getHours() - 2);
    return actualTime;
  };

  return (
    <div className="min-h-screen bg-noir-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Plane className="w-8 h-8 text-sapphire-400" />
            <h1 className="text-3xl font-bold">Suivi des vols</h1>
          </div>
          <p className="text-gray-400">Gestionnaire de vols intégré aux réservations</p>
        </div>

        {/* Info Box */}
        <div className="mb-8 bg-sapphire-500/10 border border-sapphire-500/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-sapphire-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sapphire-300 mb-2">Suivi automatique des vols</h3>
              <p className="text-sm text-gray-300">
                Le suivi automatique des vols permet d'ajuster les heures de prise en charge en
                temps réel. Quand un vol est retardé ou annulé, la réservation est mise à jour
                automatiquement et le client est notifié.
              </p>
            </div>
          </div>
        </div>

        {/* Check Flights Button */}
        <div className="mb-6">
          <button
            onClick={handleCheckFlights}
            disabled={isChecking}
            className="flex items-center gap-2 bg-sapphire-600 hover:bg-sapphire-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
            Vérifier les vols
          </button>
        </div>

        {/* Table */}
        {reservationsWithFlights.length > 0 ? (
          <div className="bg-white/5 border border-sapphire-500/20 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sapphire-500/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                      Numéro de réservation
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                      Numéro de vol
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                      Statut du vol
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                      Date/Heure
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                      Statut
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {reservationsWithFlights.map((reservation) => {
                    const flightStatus = flightStatuses.find(
                      (fs) => fs.reservationId === reservation.id
                    );
                    const isExpanded = expandedFlights[reservation.id];

                    return (
                      <React.Fragment key={reservation.id}>
                        <tr className="border-b border-sapphire-500/10 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-300">
                            {reservation.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {reservation.client_name}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-sapphire-300">
                            {reservation.flight_number}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {flightStatus ? (
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getFlightStatusBadgeClass(
                                  flightStatus.status
                                )}`}
                              >
                                {getFlightStatusIcon(flightStatus.status)}
                                {getFlightStatusLabel(flightStatus.status)}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">Non vérifié</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {formatDate(new Date(reservation.ride_datetime))}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                reservation.status === 'confirmed'
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                              }`}
                            >
                              {reservationStatusLabel(reservation.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {flightStatus && (
                              <button
                                onClick={() => toggleFlightExpand(reservation.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <ChevronDown
                                  className={`w-5 h-5 text-sapphire-400 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Flight Details */}
                        {isExpanded && flightStatus && (
                          <tr className="border-b border-sapphire-500/10 bg-white/5">
                            <td colSpan={7} className="px-6 py-6">
                              <div className="bg-white/5 border border-sapphire-500/20 rounded-lg p-6 backdrop-blur-sm space-y-4">
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                                  <div>
                                    <p className="text-xs text-gray-400 mb-1">Numéro de vol</p>
                                    <p className="font-semibold text-white">
                                      {reservation.flight_number}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-1">Compagnie aérienne</p>
                                    <p className="font-semibold text-white">
                                      {reservation.flight_number?.startsWith('AF')
                                        ? 'Air France'
                                        : 'International Airlines'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-1">Statut</p>
                                    <p className="font-semibold">
                                      <span
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${getFlightStatusBadgeClass(
                                          flightStatus.status
                                        )}`}
                                      >
                                        {getFlightStatusIcon(flightStatus.status)}
                                        {getFlightStatusLabel(flightStatus.status)}
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-1">Départ prévu</p>
                                    <p className="font-semibold text-white">
                                      {new Date(flightStatus.scheduledDeparture).toLocaleTimeString(
                                        'fr-FR',
                                        {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        }
                                      )}
                                    </p>
                                  </div>
                                  {flightStatus.actualDeparture && (
                                    <div>
                                      <p className="text-xs text-gray-400 mb-1">Départ réel</p>
                                      <p className="font-semibold text-white">
                                        {new Date(
                                          flightStatus.actualDeparture
                                        ).toLocaleTimeString('fr-FR', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {flightStatus.status === 'delayed' &&
                                  flightStatus.actualDeparture && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded p-4 mt-4">
                                      <p className="text-sm text-amber-300 mb-2 font-medium">
                                        Heure de prise en charge suggérée
                                      </p>
                                      <p className="text-lg font-semibold text-white">
                                        {getAdjustedPickupTime(flightStatus)?.toLocaleTimeString(
                                          'fr-FR',
                                          {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          }
                                        )}
                                      </p>
                                    </div>
                                  )}

                                <button className="mt-4 w-full bg-sapphire-600 hover:bg-sapphire-500 px-4 py-2 rounded-lg transition-colors font-medium text-sm">
                                  Mettre à jour la réservation
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-sapphire-500/20 rounded-lg p-12 text-center backdrop-blur-sm">
            <Plane className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">Aucune réservation avec numéro de vol</p>
          </div>
        )}

        {statusChecked && flightStatuses.length > 0 && (
          <div className="mt-6 text-sm text-gray-400">
            <p>
              ✓ Dernière vérification effectuée. {flightStatuses.filter((fs) => fs.status === 'delayed').length} vol(s)
              retardé(s), {flightStatuses.filter((fs) => fs.status === 'cancelled').length} vol(s) annulé(s).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
