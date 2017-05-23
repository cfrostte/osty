require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Osty
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
    config.i18n.default_locale = :es
    config.assets.paths << Rails.root.join("app", "assets", "fonts")
    config.assets.precompile << /\.(?:svg|eot|woff|ttf)\z/
    config.assets.precompile += %w(*.png *.jpg *.jpeg *.gif,
"fontawesome-webfont.ttf",
"fontawesome-webfont.eot",
"fontawesome-webfont.svg",
"fontawesome-webfont.woff")

  end
end
