class ApplicationController < ActionController::Base
    before_action :load_networks

    private

    def load_networks
    @networks = YAML.load_file(Rails.root.join('config', 'networks.yml'))
    end

end
