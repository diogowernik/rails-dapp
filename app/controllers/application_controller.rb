class ApplicationController < ActionController::Base
    before_action :load_networks

    # private

    def load_networks
        file_path = Rails.root.join('app', 'javascript', 'config', 'networks.json')
        @networks = JSON.parse(File.read(file_path))
    end
    
    def networks_config
        render json: @networks
    end

end
