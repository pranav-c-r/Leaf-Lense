import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Brain, Calendar, Target } from 'lucide-react'

const Insights = () => {
  const insights = [
    {
      id: 1,
      type: 'warning',
      title: 'Nitrogen Deficiency Detected',
      description: 'Your wheat crops show signs of nitrogen deficiency. Consider applying urea fertilizer within the next week.',
      confidence: 87,
      impact: 'High',
      action: 'Apply 50kg/ha urea fertilizer',
      deadline: '3 days',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      id: 2,
      type: 'success',
      title: 'Optimal Weather Conditions',
      description: 'Current weather patterns are ideal for crop growth. Expect 15% higher yield than average.',
      confidence: 94,
      impact: 'High',
      action: 'Monitor moisture levels',
      deadline: 'Ongoing',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 3,
      type: 'info',
      title: 'Disease Risk Assessment',
      description: 'Low risk of fungal diseases this week due to optimal humidity levels.',
      confidence: 91,
      impact: 'Medium',
      action: 'Continue monitoring',
      deadline: '1 week',
      icon: Target,
      color: 'blue'
    }
  ]

  const recommendations = [
    { title: 'Increase nitrogen application by 20kg/ha', category: 'Fertilization', priority: 'High' },
    { title: 'Monitor soil moisture daily', category: 'Irrigation', priority: 'Medium' },
    { title: 'Apply preventive fungicide spray', category: 'Disease Prevention', priority: 'Low' },
    { title: 'Harvest timing optimization needed', category: 'Planning', priority: 'Medium' }
  ]

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
      case 'success': return 'from-green-500/20 to-green-600/10 border-green-500/30'
      case 'info': return 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/20'
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'Low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Insights</h1>
            <p className="text-gray-400">Smart recommendations and analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Brain className="h-5 w-5 animate-pulse text-green-400" />
          <span className="text-sm">Real-time Analysis</span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Key Insights</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className={`bg-gradient-to-br backdrop-blur-sm rounded-2xl p-6 border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    insight.color === 'yellow' ? 'bg-yellow-500/20' :
                    insight.color === 'green' ? 'bg-green-500/20' :
                    insight.color === 'blue' ? 'bg-gray-500/20' : 'bg-gray-500/20'
                  }`}>
                    <insight.icon className={`h-5 w-5 ${
                      insight.color === 'yellow' ? 'text-yellow-400' :
                      insight.color === 'green' ? 'text-green-400' :
                      insight.color === 'blue' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{insight.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'High' ? 'text-red-400 bg-red-500/20' :
                      insight.impact === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                      'text-green-400 bg-green-500/20'
                    }`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-300">{insight.confidence}%</span>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{insight.action}</div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {insight.deadline}
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Action Recommendations</h2>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{rec.title}</div>
                  <div className="text-sm text-gray-400">{rec.category}</div>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                {rec.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">+15%</span>
          </div>
          <h3 className="font-bold text-white mb-2">Yield Improvement</h3>
          <p className="text-gray-400 text-sm">Expected increase vs last season</p>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">94%</span>
          </div>
          <h3 className="font-bold text-white mb-2">AI Accuracy</h3>
          <p className="text-gray-400 text-sm">Prediction confidence level</p>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">12</span>
          </div>
          <h3 className="font-bold text-white mb-2">Active Insights</h3>
          <p className="text-gray-400 text-sm">Real-time recommendations</p>
        </div>
      </div>
    </div>
  )
}

export default Insights