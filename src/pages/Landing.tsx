import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Calendar, Users, LayoutDashboard, Zap, Shield, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Kanban Board',
      description: 'Visualize your workflow with drag-and-drop task management'
    },
    {
      icon: Calendar,
      title: 'Calendar Integration',
      description: 'Keep track of deadlines and schedule tasks efficiently'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members and work together in real-time'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'See changes instantly across all devices'
    },
    {
      icon: Shield,
      title: 'Role-based Access',
      description: 'Control who can see and edit different parts of your workspace'
    },
    {
      icon: Globe,
      title: 'Work from Anywhere',
      description: 'Access your workspace from any device, anywhere'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp',
      content: 'This app transformed how our team manages projects. The Kanban board is intuitive and the real-time updates keep everyone in sync.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Startup Founder',
      company: 'InnovateLabs',
      content: 'Perfect for small teams. Easy to set up, powerful features, and great value. We were productive from day one.',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Team Lead',
      company: 'DesignStudio',
      content: 'The calendar integration is a game-changer. We never miss deadlines anymore and everyone knows what to work on.',
      avatar: 'ER'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">P</span>
              </div>
              <span className="text-lg font-semibold text-foreground">ProductivityApp</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link to="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Organize Your Team's Work
            <br />
            <span className="text-primary">In One Place</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Boost productivity with our all-in-one workspace. Manage tasks, track progress, 
            and collaborate seamlessly with your team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/demo"
              className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              View Demo
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Product Screenshot */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">To Do</h3>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded border border-border">
                      <p className="text-sm font-medium">Design new landing page</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">Design</span>
                        <span className="text-xs text-muted-foreground">Due tomorrow</span>
                      </div>
                    </div>
                    <div className="bg-card p-3 rounded border border-border">
                      <p className="text-sm font-medium">Update API documentation</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">Docs</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">In Progress</h3>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded border border-border">
                      <p className="text-sm font-medium">Implement user authentication</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">Backend</span>
                        <span className="text-xs text-orange-600">High Priority</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">Done</h3>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded border border-border opacity-75">
                      <p className="text-sm font-medium line-through">Set up project repository</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">Setup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help teams of all sizes work more efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by Teams Everywhere
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border">
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your team's needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card rounded-lg p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-2">Free</h3>
              <p className="text-3xl font-bold text-foreground mb-1">$0</p>
              <p className="text-muted-foreground mb-6">per month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Up to 3 team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Unlimited tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Basic integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">7-day activity history</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-card rounded-lg p-8 border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Pro</h3>
              <p className="text-3xl font-bold text-foreground mb-1">$12</p>
              <p className="text-muted-foreground mb-6">per user/month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Unlimited team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Unlimited history</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Custom integrations</span>
                </li>
              </ul>
              <Link
                to="/signup?plan=pro"
                className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card rounded-lg p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-foreground mb-1">Custom</p>
              <p className="text-muted-foreground mb-6">tailored to your needs</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">SSO/SAML</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Custom contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">On-premise option</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="block w-full text-center px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams already using ProductivityApp to get more done.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">P</span>
                </div>
                <span className="text-lg font-semibold text-foreground">ProductivityApp</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The all-in-one workspace for modern teams.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link to="/integrations" className="text-sm text-muted-foreground hover:text-foreground">Integrations</Link></li>
                <li><Link to="/changelog" className="text-sm text-muted-foreground hover:text-foreground">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
                <li><Link to="/security" className="text-sm text-muted-foreground hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 ProductivityApp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};