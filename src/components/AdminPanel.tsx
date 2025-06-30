
import { Shield, Users, Ban, AlertTriangle, Settings, BarChart3, MessageSquare } from 'lucide-react';

export function AdminPanel() {
  const adminStats = {
    totalUsers: 1247,
    onlineUsers: 89,
    totalRooms: 5,
    reportsToday: 3,
    bannedUsers: 12,
  };

  const recentReports = [
    {
      id: '1',
      reporter: 'User#1234',
      reported: 'User#5678',
      reason: 'Langage inapproprié',
      room: 'Rencontres',
      timestamp: '10:30',
    },
    {
      id: '2',
      reporter: 'User#9876',
      reported: 'User#5432',
      reason: 'Harcèlement',
      room: 'Amis',
      timestamp: '09:15',
    },
    {
      id: '3',
      reporter: 'User#1111',
      reported: 'User#2222',
      reason: 'Spam',
      room: 'Général',
      timestamp: '08:45',
    },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Panneau d'Administration</h1>
          <p className="text-gray-600">Gérez votre plateforme de tchat multisalles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Utilisateurs Total</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Ligne</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.onlineUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Salles Actives</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Signalements</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.reportsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Ban className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Utilisateurs Bannis</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.bannedUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Signalements Récents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signalé par
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur signalé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.reporter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.reported}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-yellow-600 hover:text-yellow-900 transition-colors">
                          Avertir
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition-colors">
                          Bannir
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          Ignorer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Modération</h3>
            </div>
            <p className="text-gray-600 mb-4">Gérez les utilisateurs et les signalements</p>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              Ouvrir les Outils de Modération
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
            </div>
            <p className="text-gray-600 mb-4">Consultez les analyses détaillées</p>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              Voir les Statistiques
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
            </div>
            <p className="text-gray-600 mb-4">Paramètres de la plateforme</p>
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
              Ouvrir les Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
